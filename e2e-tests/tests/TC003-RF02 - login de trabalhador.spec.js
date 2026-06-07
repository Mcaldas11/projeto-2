const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC003-RF02 - login de trabalhador', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
    });

    after(async function () {
        await test.teardown();
    });

    it('deve fazer login com sucesso como trabalhador', async function () {
        await test.get('/login');
        
        await test.waitAndType('#email', 'responsavel.1@vcc.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');

        try {
            await test.driver.wait(until.urlContains('/perfil'), 15000);
        } catch (e) {
            console.log('Current URL:', await test.getCurrentUrl());
            throw e;
        }
        
        const url = await test.getCurrentUrl();
        expect(url).to.match(/\/responsavel\/perfil|\/trabalhador\/perfil/);
    });
});
