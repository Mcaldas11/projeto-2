const { expect } = require('chai');
const { until } = require('selenium-webdriver');
const BaseTest = require('./base');

describe('TC006-RF04 - visualizar ocorrencias', function () {
    let test;

    before(async function () {
        test = new BaseTest();
        await test.setup();
        
        // Login as citizen
        await test.get('/login');
        await test.waitAndType('#email', 'test_cidadao@example.pt');
        await test.waitAndType('#password', 'Password123!');
        await test.waitAndClick('.btn-sign-in');
        await test.driver.wait(until.urlContains('/conta'), 15000);
    });

    after(async function () {
        await test.teardown();
    });

    it('deve visualizar a lista de ocorrências do cidadão', async function () {
        await test.get('/ocorrencias');
        
        // Wait for the table to be present
        await test.driver.wait(until.elementLocated({ css: '.occ-table' }), 10000);
        
        const rows = await test.driver.findElements({ css: '.occ-table tbody tr' });
        expect(rows).to.be.an('array');
    });
});
