import { DATA_FEDERATION_NAMESPACE } from '../constants/common';
import { Providers, TEST_DATA_SOURCE } from '../constants/tests';
import { createDataSource } from './data-resource';

export const createBucket = (
  bucketName: string,
  dataSourceName: string,
  useExistingDataSource: boolean
) => {
  cy.log(`creating bucket ${bucketName}`);
  cy.byTestID('item-create').click();
  cy.log(`entering bucket name as ${bucketName}`);
  cy.byTestID('bucket-name-text').type(bucketName);
  cy.byTestID('read-write-dropdown')
    .should('be.visible')
    .find('button')
    .first()
    .click();
  if (useExistingDataSource) {
    cy.log(`selecting data source ${dataSourceName}`);
    cy.contains(dataSourceName).click();
  } else {
    cy.log(`Creating new data source`);
    createDataSource(Providers.AWS, TEST_DATA_SOURCE);
  }
};

export const ConfirmCreateBucket = () => {
  cy.byTestID('namespace-dropdown')
    .should('be.visible')
    .contains(DATA_FEDERATION_NAMESPACE);
  cy.log('Create bucket policy');
  cy.byTestID('confirm-action-bucket').click();
};

export const checkBucketCreation = (
  bucketName: string,
  dataSourceName: string
) => {
  cy.log('Verify bucket policy created');
  cy.byTestSelector('details-item-value__Name').should('contain', bucketName);
  cy.log('Verify bucket policy is Ready');
  cy.byTestID('status-text').should('contain', 'Ready');
  cy.log('Verify only 1 data source is connected');
  cy.byTestID('mcg-resource-popover')
    .should('be.visible')
    .should('contain', '1 data source');
  cy.log('Verify name of the connected data source');
  cy.byTestID('mcg-resource-popover').should('be.visible').click();
  cy.contains(dataSourceName);
  cy.log('Verify if OBC is created or not');
  cy.byTestID('obc-resource-popover')
    .should('be.visible')
    .should('contain', '1 ObjectBucketClaim');
};

export const deleteBucket = (bucketName: string) => {
  cy.log(`deleting bucket ${bucketName}`);
  cy.byTestID(bucketName).first().click();
  cy.byTestID('details-actions').find('button').click();
  cy.byTestID('details-actions').find('li').last().click();
  cy.byTestID('delete-action').click();
  cy.byTestID(bucketName).should('not.exist');
};
