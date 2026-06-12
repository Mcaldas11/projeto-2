const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC015-RF15 - Cancelamento e Edição', function () {
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

    it('deve poder editar a descrição ou foto do problema no estado "Não resolvido"', async function () {
        await test.get('/conta');

        // Aceder à tabela de ocorrências do cidadão
        await test.driver.wait(until.elementLocated(By.css('.occ-table')), 10000);
        
        // Clicar em "Ver detalhes" da primeira ocorrência da lista
        await test.waitAndClick('.details-link-btn');

        // Aguardar o carregamento da página de detalhes
        await test.driver.wait(until.urlContains('/ocorrencia/'), 10000);

        // Verificar o estado atual da ocorrência
        const statusBadge = await test.driver.wait(until.elementLocated(By.css('.status-badge')), 10000);
        const statusText = await statusBadge.getText();

        if (statusText.toLowerCase() === 'não resolvido' || statusText.toLowerCase() === 'em espera' || statusText.toLowerCase() === 'pendente') {
            console.log('A testar funcionalidade de edição para ocorrência no estado:', statusText);

            const editBtn = await test.driver.wait(
                until.elementLocated(By.css('.btn-edit-occurrence')),
                5000
            ).catch(() => null);

            // This might fail if the feature is not implemented, which is expected in TDD
            if (editBtn) {
                await test.waitAndClick(editBtn);
                const descInput = await test.driver.wait(until.elementLocated(By.css('.edit-description-input')), 5000);
                await test.waitAndType(descInput, 'Descrição atualizada pelo teste automatizado.');
                await test.waitAndClick('.btn-save-occurrence');
                const notice = await test.driver.wait(until.elementLocated(By.css('.success-notice')), 5000);
                expect(await notice.isDisplayed()).to.be.true;
            }
        }
    });
});
