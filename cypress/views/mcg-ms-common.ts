import { DATA_FEDERATION, DATA_SERVICES } from '../constants/common';

export const MCGMSCommon = {
  visitMcgMsDashboard: () => {
    cy.visit('/');
    cy.log('navigating to mcgms-console operator from the side navigation bar');
    cy.clickNavLink([DATA_SERVICES, DATA_FEDERATION]);
    cy.log('making sure we are routed to proper endpoint');
    cy.location('pathname').should('eq', '/mcgms/cluster');
  },
  visitBucketPolicyList: () => {
    cy.clickNavLink([DATA_SERVICES, DATA_FEDERATION]);
    cy.byLegacyTestID('horizontal-link-Bucket policy').click();
  },
  visitDataSourceListPage: (skipDashboard = false) => {
    if (!skipDashboard) MCGMSCommon.visitMcgMsDashboard();
    cy.log('selecting data source from the horizontal navigation bar');
    cy.byLegacyTestID('horizontal-link-Data source').first().click();
    cy.location('pathname').should(
      'eq',
      '/mcgms/cluster/resource/noobaa.io~v1alpha1~NamespaceStore'
    );
  },
  checkDefaultBucketExistence: () => {
    MCGMSCommon.visitMcgMsDashboard();
    cy.log('checking whether default bucket is created');
    cy.byLegacyTestID('horizontal-link-Buckets').click();
    cy.byTestRows('resource-row').each(($el) => {
      cy.wrap($el).within(() => {
        /* eslint-disable cypress/require-data-selectors */
        cy.get('td')
          .eq(0)
          .should('be.visible')
          .should('contain', 'nooba-default-bucket-class');
      });
    });
  },
};
