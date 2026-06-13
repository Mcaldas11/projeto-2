const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('Responsavel - Gestao de Recursos', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
        
        // Login as responsible
        await test.backgroundLogin('responsavel._e2e_test@vcc.pt', 'Password123!', '/responsavel/recursos');
    });

    afterEach(async function () {
        if (test && test.driver) {
            await test.takeScreenshot(this.currentTest.title);
        }
    });

    after(async function () {
        await test.teardown();
    });

    it('[RF20, RF31] deve registar e gerir recursos municipais', async function () {
        await test.get('/responsavel/recursos');
        
        // 1. Criar novo recurso
        await test.waitAndClick('.btn-create-worker');
        
        const resourceName = 'Viatura E2E ' + Date.now();
        // The placeholder is "Ex: Carrinha de transporte"
        await test.waitAndType('input[placeholder*="Carrinha"]', resourceName);
        
        // First select is Estado Inicial
        await test.selectOptionByText('.modal-select', 'Operacional');
        
        // Second select is Equipa Responsável
        const selects = await test.driver.findElements(By.css('.modal-select'));
        if (selects.length > 1) {
            // Find any valid team option
            const options = await selects[1].findElements(By.css('option'));
            let found = false;
            for (const opt of options) {
                const text = await opt.getText();
                if (text && text.trim().length > 0 && !text.includes('Selecione')) {
                    await opt.click();
                    found = true;
                    break;
                }
            }
        }
        
        await test.waitAndClick('.modal-btn.confirm');
        
        // Handle alert if any
        try {
            await test.driver.wait(until.alertIsPresent(), 2000);
            await test.driver.switchTo().alert().accept();
        } catch (e) {}
        
        // 2. Verificar na tabela
        const row = await test.findPaginatedElement(`//tr[td[contains(., '${resourceName}')]]`, 10);
        expect(row).to.exist;
        
        // 3. Editar estado
        const editBtn = await row.findElement(By.css('img[title="Editar Estado"]'));
        await test.waitAndClick(editBtn);
        
        await test.selectOptionByText('.modal-select', 'Manutenção');
        await test.waitAndClick('.modal-btn.confirm');

        // Handle alert if any
        try {
            await test.driver.wait(until.alertIsPresent(), 2000);
            await test.driver.switchTo().alert().accept();
        } catch (e) {}
        
        await test.driver.sleep(1000);
        const statusCell = await row.findElement(By.xpath("./td[2]"));
        expect(await statusCell.getText()).to.equal('Manutenção');
    });
});
