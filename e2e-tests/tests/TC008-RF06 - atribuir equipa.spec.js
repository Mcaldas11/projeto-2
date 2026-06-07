const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC008-RF06 - atribuir equipa', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
        
        // Login as admin
        await test.get('/login');
        await test.waitAndType('#email', 'admin@vcc.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');
        await test.driver.wait(until.urlContains('/admin'), 15000);
    });

    after(async function () {
        await test.teardown();
    });

    it('deve atribuir um trabalhador a uma equipa com sucesso', async function () {
        await test.get('/admin/trabalhadores');
        
        // Wait for workers table and click edit on first worker
        await test.waitAndClick('.btn-icon'); // First edit icon

        // Select a team
        const select = await test.driver.wait(until.elementLocated({ css: '.edit-input' }), 10000);
        await test.type(select, 'Equipa 1'); // Assuming 'Equipa 1' exists from setup script

        // Save
        await test.waitAndClick('.modal-btn.confirm');

        // Check success message or just verify modal closed
        await test.driver.sleep(2000);
        const modal = await test.driver.findElements({ css: '.modal-overlay' });
        expect(modal.length).to.equal(0);
    });
});
