const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC004-RF02 - login de administrador', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
    });

    after(async function () {
        await test.teardown();
    });

    it('deve fazer login com sucesso como administrador', async function () {
        await test.get('/login');
        
        await test.waitAndType('#email', 'admin@vcc.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');

        try {
            await test.driver.wait(until.urlContains('/admin'), 15000);
        } catch (e) {
            console.log('Current URL:', await test.getCurrentUrl());
            throw e;
        }
        
        const url = await test.getCurrentUrl();
        expect(url).to.contain('/admin');
    });
});
