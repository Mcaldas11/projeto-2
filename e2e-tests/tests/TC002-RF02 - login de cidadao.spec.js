const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC002-RF02 - login de cidadao', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
    });

    afterEach(async function () {
        if (test && test.driver) {
            await test.takeScreenshot(this.currentTest.title);
        }
    });

    after(async function () {
        await test.teardown();
    });

    it('deve fazer login com sucesso como cidadão', async function () {
        await test.get('/login');
        
        await test.waitAndType('#email', 'test_cidadao_e2e_test@example.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');

        // Should redirect to /conta
        try {
            await test.driver.wait(until.urlContains('/conta'), 15000);
        } catch (e) {
            const currentUrl = await test.getCurrentUrl();
            console.log('Current URL:', currentUrl);
            throw e;
        }
        
        const url = await test.getCurrentUrl();
        expect(url).to.contain('/conta');
    });
});
