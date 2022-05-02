describe('Checks if auth is setup', () => {
    before(() => {
        cy.login();
    });
    after(() => {
        cy.logout();
    });
    it('Visits the app root url', () => {
        cy.visit('/');
    });
});
