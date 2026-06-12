const fs = require('fs');
const path = require('path');
const { Builder, Capabilities, By, until, Key, WebElement } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

// Create a single timestamp for the entire test run
const runTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
const imgDir = path.join(__dirname, '..', 'img', runTimestamp);

class BaseTest {
    constructor() {
        this.baseUrl = (process.env.BASE_URL || 'http://127.0.0.1:5176').replace(/\/$/, '');
        this.apiUrl = (process.env.API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
        this.driver = null;
    }

    async setup() {
        const options = new chrome.Options();
        
        if (process.env.HEADLESS === 'true') {
            options.addArguments('--headless');
            options.addArguments('--no-sandbox');
            options.addArguments('--disable-dev-shm-usage');
        }

        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        
        // Removed long implicit wait to rely on explicit waits for better performance
        await this.driver.manage().setTimeouts({ implicit: 500 });
    }

    async takeScreenshot(name) {
        if (!this.driver) return;
        if (!fs.existsSync(imgDir)) {
            fs.mkdirSync(imgDir, { recursive: true });
        }
        try {
            const image = await this.driver.takeScreenshot();
            const safeName = (name || 'screenshot').replace(/[^a-z0-9-]/gi, '_').substring(0, 100);
            const filepath = path.join(imgDir, `${safeName}.png`);
            fs.writeFileSync(filepath, image, 'base64');
        } catch (err) {
            console.error('❌ Failed to take screenshot:', err);
        }
    }

    async teardown() {
        if (this.driver) {
            await this.driver.quit();
        }
    }

    async get(path = '') {
        const targetUrl = `${this.baseUrl}${path.startsWith('/') ? path : '/' + path}`;
        await this.driver.get(targetUrl);
        
        try {
            await this.driver.wait(async (d) => {
                const readyState = await d.executeScript('return document.readyState');
                return readyState === 'complete';
            }, 15000);
        } catch (e) {
            // Ignore timeout on readyState, sometimes it hangs but page is usable
        }
    }

    async backgroundLogin(email, password, redirectPath = '/') {
        // We need to be on the page first to access localStorage
        await this.get('/');
        
        const loginUrl = `${this.apiUrl}/auth/login`;
        
        // Use executeAsyncScript to perform the fetch and set localStorage
        await this.driver.executeAsyncScript(async (url, email, password, done) => {
            try {
                const response = await fetch(url, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const payload = await response.json();
                if (!response.ok) {
                    done({ success: false, error: payload.message });
                    return;
                }
                
                const resolvedRole = payload.userType === 'trabalhador_admin' ? 'admin' :
                                   payload.userType === 'trabalhador_responsavel' ? 'responsavel' :
                                   payload.userType === 'trabalhador' ? 'trabalhador' : 'cidadao';
                                   
                localStorage.setItem('role', resolvedRole);
                localStorage.setItem('authToken', payload.token);
                localStorage.setItem('authUserType', payload.userType || resolvedRole);
                localStorage.setItem('authUserId', String(payload.userId || ''));
                
                // Fetch profile to match LoginView logic
                let endpoint = (payload.userType && payload.userType.startsWith('trabalhador')) ? 
                               '/trabalhadores/me' : '/cidadaos/me';
                
                const baseUrl = url.replace('/auth/login', '');
                const profileRes = await fetch(`${baseUrl}${endpoint}`, {
                    headers: { 'Authorization': `Bearer ${payload.token}` }
                });
                
                if (profileRes.ok) {
                    const profile = await profileRes.json();
                    const profileName = profile.nome || profile.nomeTrabalhador || '';
                    const parts = profileName.trim().split(/\s+/).filter(Boolean);
                    const firstName = parts[0] || '';
                    const lastName = parts.slice(1).join(' ');
                    
                    localStorage.setItem('userProfile', JSON.stringify({
                        firstName,
                        lastName,
                        email: profile.email || profile.emailTrabalhador || '',
                        nrTelemovel: profile.nrTelemovel || profile.telemovelTrabalhador || '',
                        fotoPerfil: profile.fotoPerfil || '',
                        fregCidadao: profile.fregCidadao || profile.idFreguesia || null,
                        idFreguesia: profile.fregCidadao || profile.idFreguesia || null
                    }));
                }
                
                done({ success: true });
            } catch (err) {
                done({ success: false, error: err.message });
            }
        }, loginUrl, email, password);

        if (redirectPath) {
            await this.get(redirectPath);
        }
    }

    async waitAndClick(selector, timeout = 15000) {
        let element;
        if (selector instanceof WebElement) {
            element = selector;
        } else {
            const locator = typeof selector === 'string' ? By.css(selector) : selector;
            element = await this.driver.wait(until.elementLocated(locator), timeout);
        }

        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
        await this.driver.wait(until.elementIsVisible(element), timeout);
        await this.driver.wait(until.elementIsEnabled(element), timeout);
        
        await this.driver.sleep(200);

        try {
            await element.click();
        } catch (e) {
            await this.driver.executeScript("arguments[0].click();", element);
        }
        return element;
    }

    async waitAndType(selector, text, timeout = 15000) {
        let element;
        if (selector instanceof WebElement) {
            element = selector;
        } else {
            const locator = typeof selector === 'string' ? By.css(selector) : selector;
            element = await this.driver.wait(until.elementLocated(locator), timeout);
        }

        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
        await this.driver.wait(until.elementIsVisible(element), timeout);
        
        await element.click();
        
        const currentValue = await element.getAttribute('value');
        if (currentValue && currentValue.length > 0) {
            await element.sendKeys(Key.CONTROL, "a");
            await element.sendKeys(Key.COMMAND, "a");
            await element.sendKeys(Key.BACK_SPACE);
            const stillValue = await element.getAttribute('value');
            if (stillValue && stillValue.length > 0) {
                await element.clear();
            }
        }

        await element.sendKeys(text);
        
        await this.driver.executeScript(`
            arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
            arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
        `, element);

        const finalValue = await element.getAttribute('value');
        if (finalValue !== text && text !== '') {
            await this.driver.executeScript("arguments[0].value = arguments[1];", element, text);
            await this.driver.executeScript(`
                arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
                arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            `, element);
        }
        
        return element;
    }

    async waitForUrl(pattern, timeout = 20000) {
        await this.driver.wait(until.urlContains(pattern), timeout);
    }

    async findPaginatedElement(xpathLocator, maxPages = 10) {
        for (let i = 0; i < maxPages; i++) {
            try {
                const element = await this.driver.wait(until.elementLocated(By.xpath(xpathLocator)), 2000);
                return element;
            } catch (e) {
                try {
                    const nextBtn = await this.driver.findElement(By.xpath("//button[contains(text(), 'Next')]"));
                    const isDisabled = await nextBtn.getAttribute('disabled');
                    if (isDisabled === 'true' || isDisabled === 'disabled' || isDisabled === '') {
                        break;
                    }
                    await this.waitAndClick(nextBtn, 2000);
                    await this.driver.sleep(500);
                } catch (btnErr) {
                    break;
                }
            }
        }
        throw new Error(`Element ${xpathLocator} not found across ${maxPages} pages.`);
    }

    async selectOptionByText(selector, text, timeout = 10000) {
        let selectElement;
        if (selector instanceof WebElement) {
            selectElement = selector;
        } else {
            const locator = typeof selector === 'string' ? By.css(selector) : selector;
            selectElement = await this.driver.wait(until.elementLocated(locator), timeout);
        }
        
        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", selectElement);
        await this.driver.wait(until.elementIsVisible(selectElement), timeout);
        
        try {
            await selectElement.click();
        } catch (e) {
            await this.driver.executeScript("arguments[0].click();", selectElement);
        }

        const optionLocator = By.xpath(`//option[contains(text(), '${text}')]`);
        const optionElement = await this.driver.wait(until.elementLocated(optionLocator), timeout);
        await optionElement.click();
        
        await this.driver.executeScript(`
            arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
            arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
        `, selectElement);
    }

    async type(element, text) {
        await element.sendKeys(text);
    }

    async click(element) {
        await element.click();
    }

    async getTitle() {
        return await this.driver.getTitle();
    }

    async getCurrentUrl() {
        return await this.driver.getCurrentUrl();
    }
}

module.exports = BaseTest;
