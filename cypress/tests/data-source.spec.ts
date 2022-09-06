import { DATA_FEDERATION_NAMESPACE, MINUTE } from '../constants/common';
import {
  AWS_CREDS_EXIST,
  dataSourceInputs,
  DATA_SOURCE_INPUTS,
  Providers,
  secretInputs,
  TEST_DATA_SOURCE,
} from '../constants/tests';
import { app } from '../views/common';
import { DSCommon } from '../views/data-resource';
import { MCGMSCommon } from '../views/mcg-ms-common';

const dummySecrets: secretInputs = {
  accessKey: 'test-access-key',
  secretKey: 'test-secret-key',
};
const dummyTargetBucket = 'test-target-bucket';

describe('data source creation', () => {
  before(() => {
    cy.login();
    MCGMSCommon.checkDefaultBucketExistence();
  });

  beforeEach(() => {
    MCGMSCommon.visitDataSourceListPage();
    DSCommon.navigateToCreatePage();
    app.waitForLoad();
  });

  afterEach(() => {
    DSCommon.deleteFromDetailsPage(TEST_DATA_SOURCE);
    DSCommon.deleteFromCmd(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
  });

  after(() => {
    cy.logout();
  });

  it('creates a data source having AWS as the provider', () => {
    cy.onlyOn(AWS_CREDS_EXIST);
    const { awsAccessKey, awsSecretKey, targetBucket } = DATA_SOURCE_INPUTS;
    const awsSecret: secretInputs = {
      accessKey: awsAccessKey,
      secretKey: awsSecretKey,
    };
    DSCommon.create(Providers.AWS, TEST_DATA_SOURCE, targetBucket, awsSecret);
    DSCommon.checkCreation(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
    cy.byTestID(`status-text`).should('contain', 'Ready');
  });

  it('creates a data source having S3 Compatible as the provider', () => {
    DSCommon.create(
      Providers.S3,
      TEST_DATA_SOURCE,
      dummyTargetBucket,
      dummySecrets
    );
    DSCommon.checkCreation(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
  });

  it('creates a data source having Azure Blob as the provider', () => {
    DSCommon.create(
      Providers.AZURE,
      TEST_DATA_SOURCE,
      dummyTargetBucket,
      dummySecrets
    );
    DSCommon.checkCreation(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
  });

  it('creates a data source having IBM COS as the provider', () => {
    DSCommon.create(
      Providers.IBM,
      TEST_DATA_SOURCE,
      dummyTargetBucket,
      dummySecrets
    );
    DSCommon.checkCreation(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
  });
});

describe('data source deletion', () => {
  before(() => {
    cy.login();
  });

  beforeEach(() => {
    MCGMSCommon.visitDataSourceListPage();
    DSCommon.navigateToCreatePage();
    app.waitForLoad();
    DSCommon.create(
      Providers.AWS,
      TEST_DATA_SOURCE,
      dummyTargetBucket,
      dummySecrets
    );
    DSCommon.checkCreation(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE, false);
  });

  afterEach(() => {
    DSCommon.deleteFromCmd(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
  });

  after(() => {
    cy.logout();
  });

  it('checks the data source is successfully deleted from the details page', () => {
    DSCommon.deleteFromDetailsPage(TEST_DATA_SOURCE);
  });

  it('checks the data source is successfully deleted from the list page', () => {
    DSCommon.navigateToListPageViaBreadCrumbs(TEST_DATA_SOURCE);
    cy.log(`deleting ${TEST_DATA_SOURCE} from the list page using kebab menu`);
    cy.byTestRows('resource-row')
      .should('contain', TEST_DATA_SOURCE)
      .byTestID(`${TEST_DATA_SOURCE}-kebab`)
      .click();
    cy.byTestDropDownMenu('delete-data-source').click();
    cy.byTestID('delete-action').click();
    cy.byTestRows('resource-row', { timeout: 2 * MINUTE }).should('not.exist'); // kept it 2 minute as sometimes the list page takes times to reflect the changes
  });
});

describe('data source creation input validation', () => {
  const allEnteredFields: dataSourceInputs = {
    name: 'e2e-test-data-source-2',
    provider: Providers.AWS,
    secretInfo: {
      accessKey: 'test-access-key',
      secretKey: 'test-secret-key',
    },
    targetBucket: 'test-target-bucket',
  };

  before(() => {
    cy.login();
  });

  beforeEach(() => {
    MCGMSCommon.visitDataSourceListPage();
    DSCommon.navigateToCreatePage();
    app.waitForLoad();
  });

  after(() => {
    cy.logout();
  });

  it('should not create data source as name is missing', () => {
    const inputData: dataSourceInputs = {
      ...allEnteredFields,
      name: undefined,
    };
    DSCommon.createFormInputValidation(inputData);
  });

  it('should not create data source as name exceeds its length limit', () => {
    const inputData: dataSourceInputs = {
      ...allEnteredFields,
      name: 'any-random-long-name-which-is-greater-than-',
    };
    DSCommon.createFormInputValidation(inputData);
    cy.byTestID('create-form-name-tooltip').should('be.visible');
  });

  it('should not create data source as access key is missing', () => {
    const inputData: dataSourceInputs = {
      ...allEnteredFields,
      secretInfo: { secretKey: 'test-secret-key' },
    };
    DSCommon.createFormInputValidation(inputData);
  });

  it('should not create data source as secret key is missing', () => {
    const inputData: dataSourceInputs = {
      ...allEnteredFields,
      secretInfo: { accessKey: 'test-access-key' },
    };
    DSCommon.createFormInputValidation(inputData);
  });

  it('should not create data source as target bucket is missing', () => {
    const inputData: dataSourceInputs = {
      ...allEnteredFields,
      targetBucket: undefined,
    };
    DSCommon.createFormInputValidation(inputData);
  });

  it('should not create data source as endpoint is missing for S3 compatible', () => {
    const inputData: dataSourceInputs = {
      ...allEnteredFields,
      provider: Providers.S3,
    };
    DSCommon.createFormInputValidation(inputData, false);
  });

  it('should not create data source as endpoint is missing for IBM COS', () => {
    const inputData: dataSourceInputs = {
      ...allEnteredFields,
      provider: Providers.IBM,
    };
    DSCommon.createFormInputValidation(inputData, false);
  });
});
