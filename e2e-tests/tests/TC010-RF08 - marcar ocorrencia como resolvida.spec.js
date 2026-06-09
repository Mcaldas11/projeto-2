const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
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
        // Go to worker home where tasks are listed
        await test.get('/trabalhador'); 

        // Wait for list and click "Ver detalhes"
        await test.waitAndClick('.details-link-btn');

        // Click resolve button
        await test.waitAndClick('.report-btn-secondary');

        // Select 'Resolvido'
        const select = await test.driver.wait(until.elementLocated(By.css('select.resolve-input')), 10000);
        await test.type(select, 'Resolvido');

        // Fill dates (optional but good for testing)
        const dateInputs = await test.driver.findElements(By.css('input[type="datetime-local"]'));
        if (dateInputs.length >= 2) {
            // Fill scheduled date
            await test.waitAndType(dateInputs[0], '2026-06-10T10:00');
            // Fill resolution date
            await test.waitAndType(dateInputs[1], '2026-06-10T12:00');
        }

        // Fill feedback
        await test.waitAndType('.resolve-textarea', 'Resolvido via teste automatizado Selenium.');

        // Save - be more specific with the button
        await test.waitAndClick(By.xpath("//button[contains(text(), 'Guardar resolução')]"));

        // Verify success
        const notice = await test.driver.wait(
            until.elementLocated(By.css('.resolve-notice')), 
            20000
        );
        const text = await notice.getText();
        console.log('Notice text:', text);
        expect(text.toLowerCase()).to.contain('sucesso');
    });
});

