const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('Admin - Gestao de Freguesias', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
        
        // Login as admin
        await test.backgroundLogin('admin_e2e_test@vcc.pt', 'Password123!', '/admin/freguesias');
    });

    afterEach(async function () {
        if (test && test.driver) {
            await test.takeScreenshot(this.currentTest.title);
        }
    });

    after(async function () {
        await test.teardown();
    });

    it('[RF03] deve visualizar a lista de freguesias com sucesso', async function () {
        await test.get('/admin/freguesias');
        
        // Verify table exists
        const table = await test.driver.wait(until.elementLocated(By.css('.workers-table')), 15000);
        expect(table).to.exist;

        // Verify at least one row exists
        const rows = await test.driver.wait(until.elementsLocated(By.css('.workers-table tbody tr')), 10000);
        expect(rows.length).to.be.at.least(1);
        
        const firstRowText = await rows[0].getText();
        expect(firstRowText).to.not.be.empty;
    });
});
