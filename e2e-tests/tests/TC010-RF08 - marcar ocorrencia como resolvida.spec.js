const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC010-RF08 - marcar ocorrencia como resolvida', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();

        // Login as worker (responsavel)
        await test.backgroundLogin('responsavel._e2e_test@vcc.pt', 'Password123!', '/perfil');
    });

    afterEach(async function () {
        if (test && test.driver) {
            await test.takeScreenshot(this.currentTest.title);
        }
    });

    after(async function () {
        await test.teardown();
    });

    it('deve marcar uma ocorrência como resolvida', async function () {
        // Go to worker home where tasks are listed
        await test.get('/trabalhador'); 

        // Wait for list and click "Ver detalhes"
        await test.waitAndClick('.details-link-btn');

        // Click resolve button
        await test.waitAndClick('.report-btn-secondary');

        // Select 'Resolvido'
        await test.selectOptionByText('select.resolve-input', 'Resolvido');

        // Fill feedback
        await test.waitAndType('.resolve-textarea', 'Resolvido via teste automatizado Selenium.');

        // Save
        await test.waitAndClick(By.xpath("//button[contains(text(), 'Guardar resolução')]"));

        // Verify success
        const notice = await test.driver.wait(
            until.elementLocated(By.css('.resolve-notice')), 
            20000
        );
        const text = await notice.getText();
        expect(text.toLowerCase()).to.contain('sucesso');
    });
});
