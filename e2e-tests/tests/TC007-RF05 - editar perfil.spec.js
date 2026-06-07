const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC007-RF05 - editar perfil', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
        
        // Login as citizen
        await test.get('/login');
        await test.waitAndType('#email', 'test_cidadao@example.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');
        await test.driver.wait(until.urlContains('/conta'), 15000);
    });

    after(async function () {
        await test.teardown();
    });

    it('deve editar os dados do perfil com sucesso', async function () {
        await test.get('/conta');
        
        await test.waitAndClick('.btn-edit');

        const phoneInput = await test.waitAndType('input[type="tel"]', '912345678');
        await test.waitAndClick('.modal-btn.confirm');

        // Wait for modal to close and update to reflect
        await test.driver.sleep(2000); 
        expect(await phoneInput.getAttribute('value')).to.equal('912345678');
    });
});
