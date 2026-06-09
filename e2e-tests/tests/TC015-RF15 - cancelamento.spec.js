const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC015-RF15 - Cancelamento e Edição', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();

        // Login as citizen
        await test.get('/login');
        await test.waitAndType('#email', 'test_cidadao@example.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');
        await test.driver.wait(until.urlContains('/conta'), 15000);
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

        if (statusText.toLowerCase() === 'não resolvido' || statusText.toLowerCase() === 'em espera') {
            // Se estiver "Não resolvido" (ou num estado inicial onde a edição é permitida),
            // deve existir um botão para editar a ocorrência
            
            console.log('A testar funcionalidade de edição para ocorrência no estado:', statusText);

            const editBtn = await test.driver.wait(
                until.elementLocated(By.css('.btn-edit-occurrence')),
                5000
            ).catch(() => null);

            expect(editBtn, 'O botão de edição (.btn-edit-occurrence) deve estar visível para o cidadão.').to.not.be.null;

            if (editBtn) {
                await test.waitAndClick(editBtn);

                // Espera encontrar um input/textarea para a descrição e um input file para a foto
                const descInput = await test.driver.wait(until.elementLocated(By.css('.edit-description-input')), 5000);
                await test.waitAndType(descInput, 'Descrição atualizada pelo teste automatizado.');

                // Guardar as alterações
                await test.waitAndClick('.btn-save-occurrence');

                // Verificar a mensagem de sucesso
                const notice = await test.driver.wait(until.elementLocated(By.css('.success-notice')), 5000);
                expect(await notice.isDisplayed()).to.be.true;
            }
        } else {
            console.log(`A ocorrência atual está no estado "${statusText}". O teste espera encontrar o botão de edição mesmo que falhe (TDD).`);
            
            // O teste de TDD falha propositadamente se o botão não existir
            const editBtn = await test.driver.wait(
                until.elementLocated(By.css('.btn-edit-occurrence')),
                5000
            ).catch(() => null);

            expect(editBtn, 'Funcionalidade de edição (botão .btn-edit-occurrence) não encontrada na interface.').to.not.be.null;
        }
    });
});
