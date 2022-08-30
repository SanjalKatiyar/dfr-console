import { DATA_FEDERATION_NAMESPACE } from '../constants/common';
import {
  DATA_SOURCE_NAME_AWS,
  Providers,
  TEST_DATA_SOURCE,
  secretInputs,
  DATA_SOURCE_INPUTS,
} from '../constants/tests';
import { dataSourceAWS } from '../mocks/data-source';
import { app } from '../views/common';
import { DSCommon } from '../views/data-resource';
import { MCGMSCommon } from '../views/mcg-ms-common';

describe('admin dashboard - resource provider card', () => {
  before(() => {
    cy.login();
  });

  beforeEach(() => {
    MCGMSCommon.visitMcgMsDashboard();
    app.waitForLoad();
  });

  after(() => {
    cy.exec(`oc delete --all namespacestores -n ${DATA_FEDERATION_NAMESPACE}`, {
      failOnNonZeroExit: false,
    });
    DSCommon.deleteFromCmd(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
    cy.logout();
  });

  it('should check if resource provider card is present', () => {
    cy.byTestID('resource-provider-card')
      .should('exist')
      .contains('Resource Providers');
  });

  it('should display not available when we do not have any data source in ready state', () => {
    cy.exec(
      `echo '${JSON.stringify(
        dataSourceAWS(DATA_SOURCE_NAME_AWS)
      )}' | oc create -f -`
    ).then(() => {
      cy.byTestID('resource-providers-not-available').contains('Not available');
    });
  });

  it('should display the count of providers of data source which are in ready state', () => {
    cy.log('creating a ready data source for Buclet policy test');
    MCGMSCommon.visitDataSourceListPage(true);
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

    MCGMSCommon.visitMcgMsDashboard();
    cy.byTestID('nb-resource-providers-card').contains('1 AWS');
  });
});
