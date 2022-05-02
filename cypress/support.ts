/* eslint-disable cypress/require-data-selectors */
import './support/selectors';
import './support/login';
/* import all support files above */

declare global {
  namespace Cypress {
    interface Chainable<Subject> {
      install(encrypted?: boolean): Chainable<Element>;
    }
  }
}

Cypress.on('uncaught:exception', () => {
  // don't fail on Cypress' internal errors.
  return false;
});

Cypress.Cookies.debug(true);

Cypress.Cookies.defaults({
  preserve: ['openshift-session-token', 'csrf-token'],
});
