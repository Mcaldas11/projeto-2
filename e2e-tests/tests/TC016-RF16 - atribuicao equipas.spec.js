const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC016-RF16 - Atribuição de Equipas a Ocorrências', function () {
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

    it('deve permitir que um administrador ou responsável atribua uma ocorrência a uma equipa específica', async function () {
        await test.get('/admin');

        // Aguardar o carregamento da lista de ocorrências
        await test.driver.wait(until.elementLocated(By.css('.occ-table')), 10000);
        await test.driver.sleep(1000); // Allow Vue reactivity to render the table rows
        
        // Clicar em "Ver detalhes" da ocorrência que criamos no setup
        // A ocorrência tem a descrição com o sufixo _e2e_test
        const row = await test.findPaginatedElement("//tr[td[contains(@class, 'details-cell') and contains(text(), '_e2e_test')]]", 20);
        const detailsBtn = await row.findElement(By.css('.details-link-btn'));
        await test.waitAndClick(detailsBtn);

        // Aguardar o carregamento da página de detalhes
        await test.driver.wait(until.urlContains('/ocorrencia/'), 10000);

        // Atribuir equipa
        await test.selectOptionByText('.assign-team-select', 'Equipa Teste _e2e_test');

        // Clicar no botão de confirmar atribuição
        await test.waitAndClick('.btn-assign-team');

        // Verificar se aparece uma notificação de sucesso
        const notice = await test.driver.wait(until.elementLocated(By.css('.success-notice')), 5000);
        expect(await notice.isDisplayed()).to.be.true;
    });
});
