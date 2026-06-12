const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC014-RF14 - Edição problemas', function () {
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

    it('deve visualizar estatísticas na homepage e histórico no painel do cidadão', async function () {
        // 1. Ver estatísticas na homepage
        await test.get('/');
        
        // Wait for stats container
        await test.driver.wait(until.elementLocated(By.css('.stats-container')), 10000);
        
        const statCards = await test.driver.findElements(By.css('.stat-card'));
        expect(statCards.length).to.be.at.least(2);
        
        // Número total de problemas no município (Ocorrências reportadas)
        const totalLabel = await statCards[0].findElement(By.css('.stat-label'));
        expect(await totalLabel.getText()).to.contain('reportadas');
        const totalNumber = await statCards[0].findElement(By.css('.stat-number'));
        expect(await totalNumber.isDisplayed()).to.be.true;

        // Quantos foram resolvidos (Ocorrências resolvidas)
        const resolvedLabel = await statCards[1].findElement(By.css('.stat-label'));
        expect(await resolvedLabel.getText()).to.contain('resolvidas');
        const resolvedNumber = await statCards[1].findElement(By.css('.stat-number'));
        expect(await resolvedNumber.isDisplayed()).to.be.true;

        // 2. Login as citizen to check history
        await test.backgroundLogin('test_cidadao_e2e_test@example.pt', 'Password123!', '/conta');
        
        // 3. Histórico das suas ocorrências: data, estado e tempo de resolução
        const historicoTable = await test.driver.wait(
            until.elementLocated(By.css('.occ-table')), 
            10000
        );
        
        const tableHeaders = await historicoTable.getText();
        const headersLower = tableHeaders.toLowerCase();
        
        // Assegurar que a tabela de histórico existe
        expect(await historicoTable.isDisplayed()).to.be.true;
        expect(headersLower).to.include('situação'); 
    });
});
