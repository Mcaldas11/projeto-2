const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('Auth - Logins', function () {
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

    it('[RF02] deve fazer login com sucesso como cidadão', async function () {
        await test.get('/login');
        
        await test.waitAndType('#email', 'test_cidadao_e2e_test@example.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');

        
        await test.driver.wait(until.urlContains('/conta'), 15000);
        
        const url = await test.getCurrentUrl();
        expect(url).to.contain('/conta');
        
        // Logout for next test
        await test.logout();
    });

    it('[RF02] deve fazer login com sucesso como trabalhador/responsável', async function () {
        await test.get('/login');
        
        await test.waitAndType('#email', 'responsavel._e2e_test@vcc.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');

        await test.driver.wait(until.urlMatches(/\/responsavel\/perfil|\/trabalhador\/perfil/), 15000);
        
        const url = await test.getCurrentUrl();
        expect(url).to.match(/\/responsavel\/perfil|\/trabalhador\/perfil/);

        // Logout
        await test.logout();
    });

    it('[RF02] deve fazer login com sucesso como administrador', async function () {
        await test.get('/login');
        
        await test.waitAndType('#email', 'admin_e2e_test@vcc.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');

        await test.driver.wait(until.urlContains('/admin'), 15000);
        
        const url = await test.getCurrentUrl();
        expect(url).to.contain('/admin');

        // Logout
        await test.logout();
    });
});
