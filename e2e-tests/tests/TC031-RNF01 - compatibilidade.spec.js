const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC031-RNF01 - Compatibilidade (Responsividade)', function () {
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

    it('deve ajustar o layout corretamente em dispositivos móveis', async function () {
        await test.get('/');

        // 1. Verificar layout Desktop (largura padrão > 1024px)
        await test.driver.manage().window().setRect({ width: 1280, height: 800 });
        await test.driver.sleep(1000); // Aguardar transições CSS

        const statsContainer = await test.driver.wait(until.elementLocated(By.css('.stats-container')), 10000);
        const displayType = await statsContainer.getCssValue('display');
        const flexDir = await statsContainer.getCssValue('flex-direction');
        
        console.log('Desktop - Display:', displayType, 'Flex-Direction:', flexDir);
        // Em desktop deve ser flex e row (padrão)
        expect(displayType).to.equal('flex');
        expect(flexDir).to.equal('row');

        // 2. Redimensionar para Mobile (largura < 1024px)
        await test.driver.manage().window().setRect({ width: 375, height: 812 });
        await test.driver.sleep(1000); // Aguardar transições CSS

        const flexDirMobile = await statsContainer.getCssValue('flex-direction');
        console.log('Mobile - Flex-Direction:', flexDirMobile);
        
        // Em mobile deve ser column devido à media query @media (max-width: 1024px)
        expect(flexDirMobile).to.equal('column');

        // 3. Verificar se o menu de hambúrguer está visível e funcional
        const menuIcon = await test.driver.wait(until.elementLocated(By.xpath("//span[contains(text(), '☰')]")), 10000);
        expect(await menuIcon.isDisplayed()).to.be.true;

        // Clicar no menu
        await test.waitAndClick(menuIcon);

        // Verificar se a sidebar aparece
        // O componente SidebarMenu.vue deve ter uma classe específica, vamos assumir .sidebar-overlay ou .sidebar-container
        // Pela análise do HomeView.vue, o menu é controlado por v-model="showMenu"
        const sidebar = await test.driver.wait(until.elementLocated(By.css('.sidebar-container, .sidebar-overlay, .hamburger-menu')), 10000);
        expect(await sidebar.isDisplayed()).to.be.true;
    });

    it('deve manter a funcionalidade do login em dispositivos móveis', async function () {
        await test.get('/login');
        await test.driver.manage().window().setRect({ width: 375, height: 812 });
        await test.driver.sleep(1500);

        const viewportWidth = await test.driver.executeScript('return window.innerWidth');
        console.log('Actual Viewport Width:', viewportWidth);

        const loginCard = await test.driver.wait(until.elementLocated(By.css('.login-card')), 10000);
        expect(await loginCard.isDisplayed()).to.be.true;

        const cardRect = await loginCard.getRect();
        console.log('Login Card Mobile Width:', cardRect.width);
        
        // Em mobile, o card não deve ser mais largo que o viewport
        expect(cardRect.width).to.be.at.most(viewportWidth);

        const emailInput = await test.driver.findElement(By.css('#email'));
        await test.waitAndClick(emailInput);
        expect(await test.driver.switchTo().activeElement().getAttribute('id')).to.equal('email');
    });
});
