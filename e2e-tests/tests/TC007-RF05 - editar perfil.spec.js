const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC007-RF05 - editar perfil', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
        
        // Login as citizen
        await test.backgroundLogin('test_cidadao_e2e_test@example.pt', 'Password123!', '/conta');
    });

    afterEach(async function () {
        if (test && test.driver) {
            await test.takeScreenshot(this.currentTest.title);
        }
    });

    after(async function () {
        await test.teardown();
    });

    it('deve editar os dados do perfil com sucesso', async function () {
        await test.get('/conta');
        
        await test.waitAndClick('.btn-edit');

        // The phone input is the one after the "Telemóvel:" label
        const phoneInput = await test.driver.wait(
            until.elementLocated(By.xpath("//label[contains(text(), 'Telemóvel')]/following-sibling::input")), 
            10000
        );
        
        // Use waitAndType but with the element directly
        await test.waitAndType(phoneInput, '912345678');
        
        await test.waitAndClick('.modal-btn.confirm');

        // Wait for modal to close and update to reflect
        await test.driver.sleep(2000); 
        
        // Check the value in the profile header
        const displayedPhone = await test.driver.wait(
            until.elementLocated(By.xpath("//div[@class='user-text']/p[last()]")),
            10000
        );
        expect(await displayedPhone.getText()).to.equal('912345678');
    });
});
