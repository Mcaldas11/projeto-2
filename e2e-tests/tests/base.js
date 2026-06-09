const { Builder, Capabilities, By, until, Key } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

class BaseTest {
    constructor() {
        this.baseUrl = process.env.BASE_URL || 'http://127.0.0.1:5173';
        this.driver = null;
    }

    async setup() {
        const options = new chrome.Options();
        
        // Use headless mode for CI/CD or environments without a display
        if (process.env.HEADLESS === 'true') {
            options.addArguments('--headless');
            options.addArguments('--no-sandbox');
            options.addArguments('--disable-dev-shm-usage');
        }

        this.driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
        
        await this.driver.manage().setTimeouts({ implicit: 5000 });
    }

    async teardown() {
        if (this.driver) {
            await this.driver.quit();
        }
    }

    async get(path = '') {
        await this.driver.get(`${this.baseUrl}${path}`);
        // Wait for page to be ready
        await this.driver.wait(async (d) => {
            const readyState = await d.executeScript('return document.readyState');
            return readyState === 'complete';
        }, 10000);
    }

    async waitAndClick(selector, timeout = 15000) {
        let element;
        if (selector.constructor.name === 'WebElement') {
            element = selector;
        } else {
            const locator = typeof selector === 'string' ? By.css(selector) : selector;
            element = await this.driver.wait(until.elementLocated(locator), timeout);
        }
        
        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
        await this.driver.wait(until.elementIsVisible(element), timeout);
        await this.driver.wait(until.elementIsEnabled(element), timeout);
        
        // Small delay to ensure any overlays are gone and Vue is ready
        await this.driver.sleep(100);

        try {
            await element.click();
        } catch (e) {
            // Fallback for intercepted clicks or other issues
            await this.driver.executeScript("arguments[0].click();", element);
        }
        return element;
    }

    async waitAndType(selector, text, timeout = 15000) {
        let element;
        if (selector.constructor.name === 'WebElement') {
            element = selector;
        } else {
            const locator = typeof selector === 'string' ? By.css(selector) : selector;
            element = await this.driver.wait(until.elementLocated(locator), timeout);
        }

        await this.driver.executeScript("arguments[0].scrollIntoView({block: 'center'});", element);
        await this.driver.wait(until.elementIsVisible(element), timeout);
        
        // Focus the element
        await element.click();
        
        // Clear value using backspaces to ensure Vue triggers
        const currentValue = await element.getAttribute('value');
        if (currentValue && currentValue.length > 0) {
            await element.sendKeys(Key.CONTROL, "a");
            await element.sendKeys(Key.COMMAND, "a"); // For Mac
            await element.sendKeys(Key.BACK_SPACE);
            // If still not empty, use clear
            const stillValue = await element.getAttribute('value');
            if (stillValue && stillValue.length > 0) {
                await element.clear();
            }
        }

        // Type the text
        await element.sendKeys(text);
        
        // Force sync Vue v-model
        await this.driver.executeScript(`
            arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
            arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
        `, element);

        // Verify the value was actually set
        const finalValue = await element.getAttribute('value');
        if (finalValue !== text && text !== '') {
            // Fallback: set value via script if sendKeys failed
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
