const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('Admin - Gestao de Ocorrencias', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
        
        // Login as admin
        await test.backgroundLogin('admin_e2e_test@vcc.pt', 'Password123!', '/admin');
    });

    afterEach(async function () {
        if (test && test.driver) {
            await test.takeScreenshot(this.currentTest.title);
        }
    });

    after(async function () {
        await test.teardown();
    });

    it('[RF06, RF07] deve visualizar detalhes de uma ocorrência como administrador', async function () {
        await test.get('/admin');
        const detailsBtn = await test.driver.wait(until.elementLocated(By.css('.details-link-btn')), 10000);
        await test.waitAndClick(detailsBtn);

        await test.driver.wait(until.urlContains('/ocorrencia/'), 10000);
        expect(await test.getCurrentUrl()).to.contain('/ocorrencia/');
        const breadcrumb = await test.driver.wait(until.elementLocated(By.css('.breadcrumb-header')), 10000);
        expect(breadcrumb).to.exist;
    });

    it('[RF16] deve permitir que um administrador visualize a lista de ocorrências e navegue pelas páginas', async function () {
        await test.get('/admin');
        await test.driver.wait(until.elementLocated(By.css('.occ-table')), 10000);
        
        const nextBtn = await test.driver.findElement(By.xpath("//button[contains(text(), 'Next')]")).catch(() => null);
        if (nextBtn && await nextBtn.isEnabled()) {
            await test.waitAndClick(nextBtn);
            await test.driver.sleep(1000);
            const table = await test.driver.findElement(By.css('.occ-table'));
            expect(table).to.exist;
        }
    });
});
