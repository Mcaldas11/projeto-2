const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC008-RF06 - atribuir equipa', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
        
        // Login as admin
        await test.backgroundLogin('admin_e2e_test@vcc.pt', 'Password123!', '/admin');
    });

    afterEach(async function () {
        if (test && test.driver) {
            await test.takeScreenshot(this.currentTest.title);
        }
    });

    after(async function () {
        await test.teardown();
    });

    it('deve atribuir um trabalhador a uma equipa com sucesso', async function () {
        await test.get('/admin/trabalhadores');
        
        // Wait for workers table
        await test.driver.wait(until.elementLocated(By.css('.workers-table')), 10000);

        // Find the row for the responsavel worker we created
        const workerEmail = 'responsavel._e2e_test@vcc.pt';
        
        // Wait and handle pagination if necessary
        await test.driver.sleep(1000); 

        const row = await test.findPaginatedElement(`//tr[td[contains(text(), '${workerEmail}')]]`, 20);

        // Click edit on that specific row
        const editBtn = await row.findElement(By.css('img[title="Editar"]'));
        await test.waitAndClick(editBtn);

        // Select a team
        // We know we created 'Equipa Teste _e2e_test' in setup
        await test.selectOptionByText('.modal-select', 'Equipa Teste _e2e_test');

        // Save
        await test.waitAndClick('.modal-btn.confirm');

        // Verify modal closed
        await test.driver.wait(until.stalenessOf(await test.driver.findElement(By.css('.modal-overlay'))), 10000);
        
        const modals = await test.driver.findElements({ css: '.modal-overlay' });
        expect(modals.length).to.equal(0);
    });
});
