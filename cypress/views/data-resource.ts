import { MINUTE, SECOND } from '../constants/common';
import { DATA_SOURCE_INPUTS, Providers } from '../constants/tests';

const inputCustomSecrets = (
  targetBucket: string
) => {
  const { accessKey, secretKey } = DATA_SOURCE_INPUTS;
  cy.log('setting up custom secret for the resource');
  cy.byTestID('switch-to-credentials').click();
  cy.byTestID(`namespacestore-access-key`).type(accessKey);
  cy.byTestID(`namespacestore-secret-key`).type(secretKey);
  cy.byTestID(`namespacestore-target-bucket`).type(targetBucket);
};

export const setUpProvider = (
  provider: Providers,
  enterEndpoint: boolean = true
) => {
  cy.log(`setting up ${provider} provider for the data source`);
  cy.log('selecting the provider from the provider dropdown');
  cy.byTestID(`data-source-provider`).click();
  cy.byTestDropDownMenu(provider).click();
  switch (provider) {
    case Providers.AWS:
      cy.log('AWS provider is selected, selecting the region');
      cy.byTestID(`aws-region-dropdown`).click();
      cy.byTestDropDownMenu('us-east-1').click();
      break;
    case Providers.S3:
    case Providers.IBM:
      if (enterEndpoint) {
        const endpoint = 'http://test-endpoint.com';
        cy.byTestID(`namespacestore-s3-endpoint`).type(endpoint);
      }
      break;
    default:
      break;
  }
};

const checkSecretCreation = (resourceName: string, namespace: string) => {
  cy.log('checking whether the new secret is created or not');
  cy.exec(`oc get secrets ${resourceName}-secret -n ${namespace}`, {
    failOnNonZeroExit: true,
    log: true,
    timeout: 2 * MINUTE,
  })
    .its('code')
    .should('eq', 0);
};

export const checkDataSourceCreation = (
  resourceName: string,
  namespace: string,
  secretCheck: boolean = true
) => {
  cy.log('checking whether the data source is created or not');
  cy.byTestID('resource-title', { timeout: 20 * SECOND }).should(
    'contain',
    resourceName
  );
  if (secretCheck) {
    checkSecretCreation(resourceName, namespace);
  }
};

export const navigateToCreatePage = () => {
  cy.log('navigating to data source create page to proceed with tests');
  cy.byTestID('item-create').click();
  cy.location('pathname').should(
    'eq',
    '/mcgms/resource/noobaa.io~v1alpha1~NamespaceStore/create/~new'
  );
};

export const navigateToListPageViaBreadCrumbs = (dataSourceName: string) => {
  cy.log('navigating to data source list page');
  cy.location('pathname').should(
    'eq',
    `/mcgms/resource/noobaa.io~v1alpha1~NamespaceStore/${dataSourceName}`
  );
  cy.byTestID('breadcrumb-link-1').click();
  cy.location('pathname').should(
    'eq',
    `/mcgms/cluster/resource/noobaa.io~v1alpha1~NamespaceStore`
  );
};

export const createDataSource = (
  provider: Providers,
  dataSourceName: string,
  bucketName: string
) => {
  cy.log(`creating data source with ${provider} as provider`);
  cy.log(`entering data source name as ${dataSourceName}`);
  cy.byTestID(`data-source-name`).type(dataSourceName);
  setUpProvider(provider);
  inputCustomSecrets(bucketName);
  cy.byTestID(`data-source-create-button`).click();
};

export const deleteUsingDetailsPageKebabMenu = (dataSourceName: string) => {
  cy.log('deleting data sources using kebab menu from details page');
  cy.location('pathname').should(
    'eq',
    `/mcgms/resource/noobaa.io~v1alpha1~NamespaceStore/${dataSourceName}`
  );
  cy.byTestID('details-actions').click();
  cy.byTestDropDownMenu('delete-data-source').click();
  cy.byTestID('delete-action').click();
};

export const deleteDataSourceResources = (
  dataSourceName: string,
  namespace: string
) => {
  cy.log(
    `deleting ${dataSourceName}-secret from ${namespace} namespace using execute command`
  );
  cy.exec(`oc delete secrets ${dataSourceName}-secret -n ${namespace} --wait`);
  cy.log(
    `deleting ${dataSourceName} from ${namespace} namespace using execute command`
  );
  cy.exec(
    `oc delete namespacestores ${dataSourceName} -n ${namespace} --wait`,
    { timeout: 5 * MINUTE, failOnNonZeroExit: false }
  );
};

export const createFormInputValidation = ({
  name,
  provider,
  accessKey,
  secretKey,
  targetBucket,
  enterEndpoint = true,
}) => {
  if (name) cy.byTestID(`data-source-name`).type(name);
  setUpProvider(provider, enterEndpoint);
  cy.byTestID('switch-to-credentials').click();
  if (accessKey) cy.byTestID(`namespacestore-access-key`).type(accessKey);
  if (secretKey) cy.byTestID(`namespacestore-secret-key`).type(secretKey);
  if (targetBucket)
    cy.byTestID(`namespacestore-target-bucket`).type(targetBucket);
  cy.byTestID(`data-source-create-button`).should('be.disabled');
};
