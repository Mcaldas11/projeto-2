const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('Responsavel - Gestao de Equipas e Trabalhadores', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();

        // Login as responsible
        await test.backgroundLogin('responsavel._e2e_test@vcc.pt', 'Password123!', '/responsavel/trabalhadores');
    });

    afterEach(async function () {
        if (test && test.driver) {
            await test.takeScreenshot(this.currentTest.title);
        }
    });

    after(async function () {
        await test.teardown();
    });

    it('[RF02] deve registar uma nova equipa de manutenção com sucesso', async function () {
        await test.get('/responsavel/equipas');
        await test.waitAndClick('.btn-create-worker');
        
        await test.selectOptionByText('.modal-select', 'Higiene e limpeza');
        
        await test.waitAndClick('.modal-btn.confirm');
        
        // Handle alert
        await test.driver.wait(until.alertIsPresent(), 10000);
        const alert = await test.driver.switchTo().alert();
        await alert.accept();

        // The teams are listed as "Higiene e limpeza" or "Equipa X"
        // Wait for the teams list to refresh
        await test.driver.sleep(1000);
        const teamNames = await test.driver.wait(until.elementsLocated(By.css('.team-name, .team-card h2')), 15000);
        let found = false;
        for (const teamNameEl of teamNames) {
            const text = await teamNameEl.getText();
            if (text.includes('Higiene e limpeza')) {
                found = true;
                break;
            }
        }
        expect(found, "Team 'Higiene e limpeza' not found in the list").to.be.true;
    });

    it('[RF04] deve registar um novo trabalhador com sucesso', async function () {
        await test.get('/responsavel/trabalhadores');
        await test.waitAndClick('.btn-create-worker');
        
        const uniqueWorkerFirst = 'Trabalhador';
        const uniqueWorkerLast = 'E2E' + Date.now();
        await test.waitAndType('input[placeholder="Ex: João"]', uniqueWorkerFirst);
        await test.waitAndType('input[placeholder="Ex: Silva"]', uniqueWorkerLast);
        await test.waitAndType('input[placeholder="nome@example.pt"]', `worker_${Date.now()}@example.pt`);
        await test.waitAndType('input[placeholder="912345678"]', '912233445');
        await test.waitAndType('input[placeholder*="ABC"]', 'Password123!');
        
        await test.waitAndClick('.modal-btn.confirm');
        
        // Handle potential alert
        try {
            await test.driver.wait(until.alertIsPresent(), 2000);
            await test.driver.switchTo().alert().accept();
        } catch (e) {}

        const row = await test.findPaginatedElement(`//tr[td[contains(., '${uniqueWorkerLast}')]]`, 10);
        expect(row).to.exist;
    });

    it('[RF06] deve atribuir um trabalhador a uma equipa com sucesso', async function () {
        await test.get('/responsavel/trabalhadores');
        
        // Wait for workers table
        await test.driver.wait(until.elementLocated(By.css('.workers-table')), 10000);

        // Find any worker we can edit.
        const row = await test.driver.wait(until.elementLocated(By.css('.workers-table tbody tr')), 10000);

        // Click edit on that specific row
        const editBtn = await row.findElement(By.css('img[title="Editar"]'));
        await test.waitAndClick(editBtn);

        // Select a team
        // The option text might be 'Higiene e limpeza' or 'Equipa'
        const select = await test.driver.wait(until.elementLocated(By.css('.modal-select')), 10000);
        const options = await select.findElements(By.css('option'));
        let found = false;
        for (const opt of options) {
            const text = await opt.getText();
            if (text && text.trim().length > 0 && text !== 'Sem Equipa') {
                await opt.click();
                found = true;
                break;
            }
        }
        expect(found, "Could not find a valid team option").to.be.true;

        // Save
        await test.waitAndClick('.modal-btn.confirm');

        // Handle alert
        try {
            await test.driver.wait(until.alertIsPresent(), 2000);
            await test.driver.switchTo().alert().accept();
        } catch (e) {}

        // Verify modal closed
        await test.driver.wait(async () => {
            const modals = await test.driver.findElements(By.css('.modal-overlay'));
            return modals.length === 0;
        }, 10000);
        
        const modals = await test.driver.findElements({ css: '.modal-overlay' });
        expect(modals.length).to.equal(0);
    });
});
