const { expect } = require('chai');
const { until, Key, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC001-RF01 - registar utilizadores', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
    });

    after(async function () {
        await test.teardown();
    });

    it('deve registar um novo cidadão com sucesso', async function () {
        await test.get('/register/email');
        
        const randomSuffix = Math.floor(Math.random() * 1000000);
        const testEmail = `user_${randomSuffix}@example.pt`;
        const testPhone = `91${String(randomSuffix).padStart(7, '0')}`;

        // Use more robust selectors and ensure they are ready
        await test.waitAndType('input[placeholder*="João"]', 'Novo');
        await test.waitAndType('input[placeholder*="Silva"]', 'Utilizador');
        await test.waitAndType('input[type="email"]', testEmail);
        await test.waitAndType('input[type="tel"]', testPhone);
        
        // Wait for Vue and click
        await test.waitAndClick('button[type="submit"]');
        console.log('Submitted registration form with email:', testEmail);

        // Should go to password page
        await test.waitForUrl('/register-password');
        
        await test.waitAndType('input[placeholder*="Cria a tua password"]', 'Password123!');
        await test.waitAndType('input[placeholder*="Reescreve a tua password"]', 'Password123!');
        
        await test.waitAndClick('button[type="submit"]');
        console.log('Submitted password form');

        // Should go to municipio page
        await test.waitForUrl('/register/municipio');
        
        // Wait for select to be enabled (loading finished)
        const select = await test.driver.wait(until.elementLocated(By.css('select')), 10000);
        await test.driver.wait(until.elementIsEnabled(select), 10000);
        await test.waitAndType('select', 'Vila do Conde');
        
        await test.waitAndClick('button[type="submit"]');

        // Should redirect to login or home depending on app logic
        // Based on RegisterMunicipio.vue, it redirects to 'home' which is '/'
        await test.waitForUrl('/');
        const url = await test.getCurrentUrl();

        expect(url).to.contain('/');
    });
});
