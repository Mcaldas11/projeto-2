const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC016-RF16 - Atribuição de Equipas a Ocorrências', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();

        // Login as admin
        await test.get('/login');
        await test.waitAndType('#email', 'admin@vcc.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');
        await test.driver.wait(until.urlContains('/admin'), 15000);
    });

    after(async function () {
        await test.teardown();
    });

    it('deve permitir que um administrador ou responsável atribua uma ocorrência a uma equipa específica', async function () {
        // Aceder à lista de ocorrências do admin (Homepage do Admin)
        await test.get('/admin');

        // Aguardar o carregamento da lista de ocorrências
        await test.driver.wait(until.elementLocated(By.css('.occ-table')), 10000);
        
        // Clicar em "Ver detalhes" da primeira ocorrência da lista
        await test.waitAndClick('.details-link-btn');

        // Aguardar o carregamento da página de detalhes
        await test.driver.wait(until.urlContains('/ocorrencia/'), 10000);

        console.log('A verificar funcionalidade de atribuição de equipa...');

        // O teste espera encontrar uma secção ou botão para atribuir equipa
        // Como o requisito pede para permitir ao município (admin/responsável) alterar/atribuir equipas,
        // esperamos que exista um select de equipas e um botão de guardar na view de detalhes.
        const assignTeamSelect = await test.driver.wait(
            until.elementLocated(By.css('.assign-team-select')),
            5000
        ).catch(() => null);

        expect(assignTeamSelect, 'O dropdown de atribuição de equipa (.assign-team-select) não foi encontrado na página.').to.not.be.null;

        if (assignTeamSelect) {
            // Selecionar uma equipa (exemplo: Equipa 1)
            await test.type(assignTeamSelect, 'Equipa');

            // Clicar no botão de confirmar atribuição
            const assignBtn = await test.driver.findElement(By.css('.btn-assign-team'));
            await test.waitAndClick(assignBtn);

            // Verificar se aparece uma notificação de sucesso
            const notice = await test.driver.wait(until.elementLocated(By.css('.success-notice')), 5000);
            expect(await notice.isDisplayed()).to.be.true;
        }
    });
});
