const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC001-RF01 - registar utilizadores', function () {
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

    it('deve registar um novo cidadão com sucesso', async function () {
        await test.get('/login');
        
        // 1. Ir para página de registo
        await test.waitAndClick('.create-account');
        await test.driver.wait(until.urlContains('/register/email'), 10000);
        
        const uniqueEmail = `user_${Date.now()}_e2e_test@example.pt`;
        
        // 2. Preencher dados de email e nome
        await test.waitAndType('input[placeholder="Ex: João"]', 'Utilizador');
        await test.waitAndType('input[placeholder="Ex: Silva"]', 'Teste E2E');
        await test.waitAndType('input[placeholder="Introduz o teu email"]', uniqueEmail);
        await test.waitAndType('input[placeholder="Ex: 912345678"]', '914455667');
        
        const continueBtn1 = await test.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Continuar')]")), 10000);
        await test.waitAndClick(continueBtn1);
        
        await test.driver.wait(until.urlContains('/register-password'), 15000);

        // 3. Preencher passwords
        await test.waitAndType('input[placeholder="Cria a tua password"]', 'Password123!');
        await test.waitAndType('input[placeholder="Reescreve a tua password"]', 'Password123!');
        
        const continueBtn2 = await test.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Continuar')]")), 10000);
        await test.waitAndClick(continueBtn2);
        
        await test.driver.wait(until.urlContains('/register/municipio'), 15000);

        // 4. Selecionar freguesia e terminar
        // Use selectOptionByText instead of type to avoid ElementNotInteractableError
        await test.selectOptionByText('select', 'Vila do Conde');
        
        const finishBtn = await test.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Começar')]")), 10000);
        await test.waitAndClick(finishBtn);

        // Should redirect to home (/)
        await test.driver.wait(until.urlIs(test.baseUrl + '/'), 20000);
        const url = await test.getCurrentUrl();
        expect(url).to.equal(test.baseUrl + '/');
    });
});
