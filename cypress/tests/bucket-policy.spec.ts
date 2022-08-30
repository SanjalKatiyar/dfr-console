import { DATA_FEDERATION_NAMESPACE, SECOND, MINUTE } from '../constants/common';
import {
  SINGLE_BUCKET_POLICY,
  TEST_DATA_SOURCE,
  DATA_SOURCE_INPUTS,
  Providers,
  secretInputs,
} from '../constants/tests';
import { app } from '../views/common';
import { DSCommon } from '../views/data-resource';
import { MCGMSCommon } from '../views/mcg-ms-common';

describe('Bucket policy page', () => {
  before(() => {
    cy.login();
    cy.log('creating a ready data source for Buclet policy test');
    MCGMSCommon.visitDataSourceListPage();
    DSCommon.navigateToCreatePage();
    app.waitForLoad();
    const { awsAccessKey, awsSecretKey, targetBucket } = DATA_SOURCE_INPUTS;
    const correctSecretCredentials: secretInputs = {
      accessKey: awsAccessKey,
      secretKey: awsSecretKey,
    };
    DSCommon.create(
      Providers.AWS,
      TEST_DATA_SOURCE,
      targetBucket,
      correctSecretCredentials
    );
    DSCommon.checkCreation(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
    cy.byTestID(`resource-status`).should('contain', 'Ready');
  });

  beforeEach(() => {
    MCGMSCommon.visitBucketPolicyList();
  });

  after(() => {
    /**
     * Need some time for BucketClass to get cleaned-up properly before deleting NamespaceStore,
     * else we get an error from server: admission webhook "admissionwebhook.noobaa.io" denied the request:
     * cannot complete because nsr "testing-data-source" in "IN_USE" state.
     * Even though BucketClass is actually deleted, there is some deplay for it to get reflected for NamespaceStore.
     */
    cy.wait(30 * SECOND);
    MCGMSCommon.visitDataSourceListPage(true);
    DSCommon.deleteFromListPage(TEST_DATA_SOURCE);
    DSCommon.deleteFromCmd(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
    cy.logout();
  });

  // ToDo(Sanjal): Add more test blocks for "Multi" and "Cache" types as well.
  it('creates Bucket policy with single data source', () => {
    cy.byTestID('item-create').click();
    cy.byTestID('bucket-name-text').type(SINGLE_BUCKET_POLICY);
    cy.byTestID('read-write-dropdown')
      .should('be.visible')
      .find('button')
      .first()
      .click();
    cy.contains(TEST_DATA_SOURCE).click();
    cy.byTestID('namespace-dropdown')
      .should('be.visible')
      .contains(DATA_FEDERATION_NAMESPACE);
    cy.log('Create bucket policy');
    cy.byTestID('confirm-action-bucket').click();
    cy.log('Verify bucket policy created');
    cy.byTestSelector('details-item-value__Name').should(
      'contain',
      SINGLE_BUCKET_POLICY
    );
    cy.log('Verify bucket policy is Ready');
    cy.byTestID('status-text').should('contain', 'Ready');
    cy.log('Verify only 1 data source is connected');
    cy.byTestID('mcg-resource-popover')
      .should('be.visible')
      .should('contain', '1 Data source');
    cy.log('Verify name of the connected data source');
    cy.byTestID('mcg-resource-popover').should('be.visible').click();
    cy.contains(TEST_DATA_SOURCE);
    cy.log('Verify if OBC is created or not');
    cy.byTestID('obc-resource-popover')
      .should('be.visible')
      .should('contain', '1 ObjectBucketClaim');
  });

  it('deletes created Bucket policy', () => {
    cy.byTestID(SINGLE_BUCKET_POLICY).first().click();
    cy.byTestID('details-actions').find('button').click();
    cy.byTestID('details-actions').find('li').last().click();
    cy.byTestID('delete-action').click();
    cy.byTestID(SINGLE_BUCKET_POLICY).should('not.exist');
  });
});
