const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC009-RF07 - visualizar rotas', function () {
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
