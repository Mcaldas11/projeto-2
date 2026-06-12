const { expect } = require('chai');
const { By, until, Key } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC008-RF06 - visualizar detalhes admin', function () {
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

    it('deve visualizar detalhes de uma ocorrência como administrador', async function () {
        await test.get('/admin');
        
        // Click on "Ver detalhes" link
        const detailsBtn = await test.driver.wait(
            until.elementLocated(By.css('.details-link-btn')), 
            10000
        );
        await test.waitAndClick(detailsBtn);

        // Wait for details page
        await test.driver.wait(until.urlContains('/ocorrencia/'), 10000);
        const url = await test.getCurrentUrl();
        expect(url).to.contain('/ocorrencia/');
        
        // Verify we are on the details view (contains breadcrumb-header)
        const breadcrumb = await test.driver.wait(until.elementLocated(By.css('.breadcrumb-header')), 10000);
        expect(breadcrumb).to.exist;
    });
});
