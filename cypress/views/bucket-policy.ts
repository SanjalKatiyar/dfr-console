import { DATA_FEDERATION_NAMESPACE } from '../constants/common';
import { DATA_SOURCE_INPUTS, Providers } from '../constants/tests';
import { createDataSource } from './data-resource';

export const BPCommon = {
  createUsingSingleDSAndExistingDataSource: (
    bucketName: string,
    dataSourceName: string
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
    cy.log(`Creating new data source`);
    cy.contains(dataSourceName).click();
  },
  createUsingSingleDSAndNewDataSource: (
    bucketName: string,
    dataSourceName: string
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
    cy.log(`Creating new data source`);
    cy.byTestID('add-data-source-item').click();
    createDataSource(
      Providers.AWS,
      dataSourceName,
      DATA_SOURCE_INPUTS.targetBucket
    );
    cy.byTestID('ready-action-finish').click();
    cy.byTestID('read-write-dropdown')
      .should('be.visible')
      .find('button')
      .first()
      .click();
    cy.byTestID('data-source-selection-item').find('li').last().click();
  },
  confirmCreateBucket: () => {
    cy.byTestID('namespace-dropdown')
      .should('be.visible')
      .contains(DATA_FEDERATION_NAMESPACE);
    cy.log('Create bucket policy');
    cy.byTestID('confirm-action-bucket').click();
  },
  createUsingMultiDS: (bucketName: string, dataSourceName: string) => {
    cy.log(`creating bucket ${bucketName}`);
    cy.byTestID('item-create').click();
    cy.log(`entering bucket name as ${bucketName}`);
    cy.byTestID('bucket-name-text').type(bucketName);
    cy.byTestID('multi-data-source-radio-button').click();
    cy.byTestID('read-dropdown').click();
    cy.log(`Configuring a data source to read`);
    cy.byTestID('data-source-selection-item').click();
    cy.byTestID('add-data-source-item').click();
    createDataSource(
      Providers.AWS,
      dataSourceName,
      DATA_SOURCE_INPUTS.targetBucket
    );
    cy.byTestID('ready-action-finish').click();
    cy.byTestID('read-dropdown').should('be.visible').first().click();
    cy.byTestID('data-source-selection-item')
      .find('li')
      .byTestID(`${dataSourceName}-dropdown-item`)
      .find('input[type=checkbox]')
      .check();
    cy.byTestID('read-dropdown').first().click();
    cy.byTestID('write-dropdown').find('button').click();
    cy.log(`Configuring a data source to write`);
    cy.byTestID('data-source-selection-item')
      .find('li')
      .byTestID(`${dataSourceName}-dropdown-item`)
      .click();
    cy.byTestID('write-dropdown').should('be.visible').first().click();
  },
  checkBucketCreation: (bucketName: string, dataSourceName: string) => {
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
  },
  deleteFromDetailsPage: (bucketName: string) => {
    cy.log(`deleting bucket ${bucketName}`);
    cy.byTestID(bucketName).first().click();
    cy.byTestID('details-actions').find('button').click();
    cy.byTestID('details-actions').find('li').last().click();
    cy.byTestID('delete-action').click();
    cy.byTestID(bucketName).should('not.exist');
  },
};
