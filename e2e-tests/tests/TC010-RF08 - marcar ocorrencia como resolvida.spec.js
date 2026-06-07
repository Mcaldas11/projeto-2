const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC010-RF08 - marcar ocorrencia como resolvida', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
        
        // Login as worker (responsavel)
        await test.get('/login');
        await test.waitAndType('#email', 'responsavel.1@vcc.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');
        await test.driver.wait(until.urlContains('/perfil'), 15000);
    });

    after(async function () {
        await test.teardown();
    });

    it('deve marcar uma ocorrência como resolvida', async function () {
        // Go to occurrences view
        await test.get('/ocorrencias'); 
        
        // Wait for list and click "Ver detalhes"
        await test.waitAndClick('.details-link-btn');

        // Click resolve button
        await test.waitAndClick('.report-btn-secondary');

        // Select 'Resolvido'
        await test.waitAndType('.resolve-input', 'Resolvido');

        // Fill feedback
        await test.waitAndType('.resolve-textarea', 'Resolvido via teste automatizado Selenium.');

        // Save
        await test.waitAndClick('.resolve-actions .report-btn');

        // Verify success
        const notice = await test.driver.wait(
            until.elementLocated({ css: '.resolve-notice' }), 
            15000
        );
        const text = await notice.getText();
        console.log('Notice text:', text);
        expect(text).to.contain('sucesso');
    });
});
