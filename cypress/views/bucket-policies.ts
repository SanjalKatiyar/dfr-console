import { DATA_FEDERATION_NAMESPACE, SECOND } from '../constants/common';

export const BPCommon = {
  createSingle: (
    bucketName: string,
    dataSourceName?: string,
    ns = DATA_FEDERATION_NAMESPACE
  ) => {
    cy.byTestID('bucket-name-text').type(bucketName);
    cy.byTestID('read-write-dropdown')
      .should('be.visible')
      .find('button')
      .first()
      .click();
    cy.contains(dataSourceName).click();
    cy.byTestID('namespace-dropdown').should('be.visible').contains(ns);
    cy.log('Create bucket policy');
    cy.byTestID('confirm-action-bucket').click();
  },
  checkCreation: (bucketName: string, dataSourceName?: string) => {
    cy.log('Verify bucket policy created');
    cy.byTestSelector('details-item-value__Name').should('contain', bucketName);
    cy.log('Verify bucket policy is Ready');
    cy.byTestID('status-text').should('contain', 'Ready');
    cy.log('Verify only 1 data source is connected');
    cy.byTestID('mcg-resource-popover')
      .should('be.visible')
      .should('contain', '1 Data source');
    cy.log('Verify name of the connected data source');
    cy.byTestID('mcg-resource-popover').should('be.visible').click();
    cy.contains(dataSourceName);
    cy.log('Verify if OBC is created or not');
    cy.byTestID('obc-resource-popover')
      .should('be.visible')
      .should('contain', '1 ObjectBucketClaim');
  },
  navigateToCreatePage: () => {
    cy.log('navigating to bucket policy create page to proceed with tests');
    cy.byTestID('item-create').click();
    cy.location('pathname').should(
      'eq',
      '/mcgms/resource/noobaa.io~v1alpha1~BucketClass/create/~new'
    );
  },
  navigateToDashboardViaBreadCrumbs: (name: string) => {
    cy.log('navigating to managed console dashboard');
    cy.location('pathname').should(
      'eq',
      `/mcgms/resource/noobaa.io~v1alpha1~BucketClass/${name}`
    );
    cy.byTestID('breadcrumb-link-0').click();
    cy.location('pathname').should('eq', `/mcgms/cluster`);
  },
  deleteFromListPage: (name: string) => {
    cy.log(`deleting ${name} from the list page using kebab menu`);
    cy.byTestRows('resource-row')
      .should('contain', name)
      .byTestID(`${name}-kebab`)
      .click();
    cy.byTestDropDownMenu('delete-bucket-policy').click();
    cy.byTestID('delete-action').click();
    cy.byTestRows('resource-row', { timeout: 10 * SECOND }).should(
      'not.contain',
      name
    );
  },
};
