const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('Responsavel - Gestao de Rotas', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();

        // Login as worker/responsible
        await test.backgroundLogin('responsavel._e2e_test@vcc.pt', 'Password123!', '/responsavel/rotas');
    });

    afterEach(async function () {
        if (test && test.driver) {
            await test.takeScreenshot(this.currentTest.title);
        }
    });

    after(async function () {
        await test.teardown();
    });

    it('[RF10] deve criar uma nova rota de manutenção com sucesso', async function () {
        await test.get('/responsavel/rotas');
        
        // Wait for occurrences to load
        await test.driver.wait(until.elementLocated({ css: '.occ-list-item' }), 15000);
        
        // Select all filtered occurrences
        const selectAllBtn = await test.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Selecionar Todas')]")), 10000);
        await test.waitAndClick(selectAllBtn);
        
        // Generate route
        const generateBtn = await test.driver.findElement({ css: '.btn-gerar-rotas' });
        await test.waitAndClick(generateBtn);
        
        // Wait for alert and accept it
        await test.driver.wait(until.alertIsPresent(), 10000);
        const alert = await test.driver.switchTo().alert();
        expect(await alert.getText()).to.contain('Rota gerada com sucesso');
        await alert.accept();
        
        // Verify new route card exists
        const routeCard = await test.driver.wait(until.elementLocated({ css: '.category-card' }), 10000);
        expect(routeCard).to.exist;
    });

    it('[RF07, RF23] deve visualizar as rotas atribuídas ao trabalhador', async function () {
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
