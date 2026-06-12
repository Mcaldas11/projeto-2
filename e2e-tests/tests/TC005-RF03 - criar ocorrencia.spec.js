const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC005-RF03 - criar ocorrencia', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
        
        // Login as citizen
        await test.backgroundLogin('test_cidadao_e2e_test@example.pt', 'Password123!', '/conta');
    });

    afterEach(async function () {
        if (test && test.driver) {
            await test.takeScreenshot(this.currentTest.title);
        }
    });

    after(async function () {
        await test.teardown();
    });

    it('deve criar uma nova ocorrência com sucesso', async function () {
        await test.get('/new-ocorrencia');
        
        await test.waitAndType('input[placeholder*="Rua"]', 'Rua de Teste E2E ' + Date.now());
        
        const selects = await test.driver.wait(until.elementsLocated({ css: 'select' }), 10000);
        await test.type(selects[0], 'Iluminação');
        await test.type(selects[1], 'Alta');
        
        await test.waitAndType('textarea', 'Teste de descrição automática via Selenium.');
        await test.waitAndClick('.btn-submit');

        // Should redirect to /ocorrencias
        await test.driver.wait(until.urlContains('/ocorrencias'), 15000);
        const url = await test.getCurrentUrl();
        expect(url).to.contain('/ocorrencias');
    });
});
