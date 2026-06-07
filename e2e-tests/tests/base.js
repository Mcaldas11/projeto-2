const { Builder, Capabilities, By, until } = require('selenium-webdriver');
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
    }

    async waitAndClick(selector, timeout = 10000) {
        const element = await this.driver.wait(
            until.elementLocated(typeof selector === 'string' ? { css: selector } : selector),
            timeout
        );
        await this.driver.wait(until.elementIsVisible(element), timeout);
        await this.driver.wait(until.elementIsEnabled(element), timeout);
        await element.click();
        return element;
    }

    async waitAndType(selector, text, timeout = 10000) {
        const element = await this.driver.wait(
            until.elementLocated(typeof selector === 'string' ? { css: selector } : selector),
            timeout
        );
        await this.driver.wait(until.elementIsVisible(element), timeout);
        await element.clear();
        await element.sendKeys(text);
        return element;
    }

    async findById(id) {
        return await this.driver.wait(until.elementLocated(By.id(id)), 10000);
    }

    async findByClass(className) {
        return await this.driver.wait(until.elementLocated(By.className(className)), 10000);
    }

    async findByCss(css) {
        return await this.driver.wait(until.elementLocated(By.css(css)), 10000);
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
