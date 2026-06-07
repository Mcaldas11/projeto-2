const { expect } = require('chai');
const { until, Key } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC001-RF01 - registar utilizadores', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
    });

    after(async function () {
        await test.teardown();
    });

    it('deve registar um novo cidadão com sucesso', async function () {
        await test.get('/register/email');
        
        const randomSuffix = Math.floor(Math.random() * 1000000);
        const testEmail = `user_${randomSuffix}@example.pt`;
        const testPhone = `91${String(randomSuffix).substring(0, 7)}`;

        await test.waitAndType('input[placeholder="Ex: João"]', 'Novo');
        await test.waitAndType('input[placeholder="Ex: Silva"]', 'Utilizador');
        await test.waitAndType('input[type="email"]', testEmail);
        await test.waitAndType('input[type="tel"]', testPhone);
        
        await test.waitAndClick('.btn-primary');

        // Should go to password page
        await test.driver.wait(until.urlContains('/register-password'), 15000);
        
        await test.waitAndType('input[placeholder="Cria a tua password"]', 'Password123!');
        await test.waitAndType('input[placeholder="Reescreve a tua password"]', 'Password123!');
        
        await test.waitAndClick('.btn-primary');

        // Should go to municipio page
        await test.driver.wait(until.urlContains('/register/municipio'), 15000);
        
        await test.waitAndType('select', 'Vila do Conde');
        await test.waitAndClick('.btn-primary');

        // Should redirect to login
        await test.driver.wait(until.urlContains('/login'), 15000);
        const url = await test.getCurrentUrl();
        expect(url).to.contain('/login');
    });
});
