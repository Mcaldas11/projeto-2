const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC009-RF07 - visualizar rotas', function () {
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

    it('deve visualizar as rotas atribuídas ao trabalhador', async function () {
        await test.get('/responsavel/rotas');
        
        // Wait for map container (using .map-leaflet class)
        const map = await test.driver.wait(
            until.elementLocated({ css: '.map-leaflet' }), 
            15000
        );
        expect(map).to.exist;

        // Check if route sidebar is present
        const sidebar = await test.driver.wait(
            until.elementLocated({ css: '.rotas-sidebar' }),
            10000
        );
        expect(sidebar).to.exist;
    });
});
