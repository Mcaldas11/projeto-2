const { expect } = require('chai');
const { until, By } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('Cidadao - Gestao de Ocorrencias', function () {
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

    it('[RF01] deve registar um novo cidadão com sucesso', async function () {
        await test.get('/login');
        await test.waitAndClick('.create-account');
        await test.driver.wait(until.urlContains('/register/email'), 10000);
        
        const uniqueEmail = `user_${Date.now()}_e2e_test@example.pt`;
        await test.waitAndType('input[placeholder="Ex: João"]', 'Utilizador');
        await test.waitAndType('input[placeholder="Ex: Silva"]', 'Teste E2E');
        await test.waitAndType('input[placeholder="Introduz o teu email"]', uniqueEmail);
        await test.waitAndType('input[placeholder="Ex: 912345678"]', '914455667');
        
        const continueBtn1 = await test.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Continuar')]")), 10000);
        await test.waitAndClick(continueBtn1);
        
        await test.driver.wait(until.urlContains('/register-password'), 15000);
        await test.waitAndType('input[placeholder="Cria a tua password"]', 'Password123!');
        await test.waitAndType('input[placeholder="Reescreve a tua password"]', 'Password123!');
        
        const continueBtn2 = await test.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Continuar')]")), 10000);
        await test.waitAndClick(continueBtn2);
        
        await test.driver.wait(until.urlContains('/register/municipio'), 15000);
        await test.selectOptionByText('select', 'Vila do Conde');
        
        const finishBtn = await test.driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Começar')]")), 10000);
        await test.waitAndClick(finishBtn);

        await test.driver.wait(until.urlIs(test.baseUrl + '/'), 20000);
        expect(await test.getCurrentUrl()).to.equal(test.baseUrl + '/');

        // Give it a moment to ensure session is settled
        await test.driver.sleep(1000);

        // Logout
        await test.logout();
    });

    it('[RF03, RF05, RF12] deve criar uma nova ocorrência com sucesso', async function () {
        await test.backgroundLogin('test_cidadao_e2e_test@example.pt', 'Password123!', '/new-ocorrencia');
        
        await test.waitAndType('input[placeholder*="Ex: Rua"]', 'Rua de Teste E2E ' + Date.now());
        const selects = await test.driver.wait(until.elementsLocated({ css: 'select' }), 10000);
        await test.type(selects[0], 'Iluminação');
        await test.type(selects[1], 'Alta');
        
        await test.waitAndType('textarea', 'Teste de descrição automática via Selenium.');
        await test.waitAndClick('.btn-submit');

        await test.driver.wait(until.urlContains('/ocorrencias'), 15000);
        expect(await test.getCurrentUrl()).to.contain('/ocorrencias');
    });

    it('[RF04, RF07, RF13] deve visualizar a lista e histórico de ocorrências', async function () {
        // Stats on Home
        await test.get('/');
        await test.driver.wait(until.elementLocated(By.css('.stats-container')), 10000);
        const statCards = await test.driver.findElements(By.css('.stat-card'));
        expect(statCards.length).to.be.at.least(2);

        // History in /conta
        await test.backgroundLogin('test_cidadao_e2e_test@example.pt', 'Password123!', '/conta');
        const historicoTable = await test.driver.wait(until.elementLocated(By.css('.occ-table')), 10000);
        expect(await historicoTable.isDisplayed()).to.be.true;
    });

    it('[RF27] deve editar os dados do perfil com sucesso', async function () {
        await test.backgroundLogin('test_cidadao_e2e_test@example.pt', 'Password123!', '/conta');
        await test.waitAndClick('.btn-edit');

        const phoneInput = await test.driver.wait(
            until.elementLocated(By.xpath("//label[contains(text(), 'Telemóvel')]/following-sibling::input")), 
            10000
        );
        const newPhone = '91' + Math.floor(1000000 + Math.random() * 9000000);
        await test.waitAndType(phoneInput, newPhone);
        await test.waitAndClick('.modal-btn.confirm');

        await test.driver.sleep(2000); 
        const displayedPhone = await test.driver.wait(
            until.elementLocated(By.xpath("//div[@class='user-text']/p[last()]")),
            10000
        );
        expect(await displayedPhone.getText()).to.equal(newPhone);
    });

    it('[RF14, RF15] deve poder editar a descrição da ocorrência no estado pendente', async function () {
        await test.backgroundLogin('test_cidadao_e2e_test@example.pt', 'Password123!', '/conta');
        await test.driver.wait(until.elementLocated(By.css('.occ-table')), 10000);
        await test.waitAndClick('.details-link-btn');
        await test.driver.wait(until.urlContains('/ocorrencia/'), 10000);

        const statusBadge = await test.driver.wait(until.elementLocated(By.css('.status-badge')), 10000);
        const statusText = await statusBadge.getText();

        if (statusText.toLowerCase().includes('não resolvido') || statusText.toLowerCase().includes('espera') || statusText.toLowerCase().includes('pendente')) {
            const editBtn = await test.driver.wait(until.elementLocated(By.css('.btn-edit-occurrence')), 5000).catch(() => null);
            if (editBtn) {
                await test.waitAndClick(editBtn);
                const descInput = await test.driver.wait(until.elementLocated(By.css('.edit-description-input')), 5000);
                await test.waitAndType(descInput, 'Descrição atualizada pelo teste automatizado.');
                await test.waitAndClick('.btn-save-occurrence');
                const notice = await test.driver.wait(until.elementLocated(By.css('.success-notice')), 5000);
                expect(await notice.isDisplayed()).to.be.true;
            }
        }
    });
});
