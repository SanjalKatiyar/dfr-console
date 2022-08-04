import { DATA_FEDERATION_NAMESPACE, SECOND, MINUTE } from '../constants/common';
import {
  SINGLE_BUCKET_POLICY,
  PVC_NAME,
  DATA_SOURCE_NAME_NSFS,
  SINGLE_BUCKET_POLICY_WITH_CACHE,
  TEST_DATA_SOURCE,
  MULTIPLE_BUCKET_POLICY,
  TEST_READ_DATA_SOURCE,
} from '../constants/tests';
import { dataSourceNSFS } from '../mocks/data-source';
import { BPCommon } from '../views/bucket-policy';
import { projectNameSpace } from '../views/common';
import { deleteDataSourceResources } from '../views/data-resource';
import { MCGMSCommon } from '../views/mcg-ms-common';
import { pvc } from '../views/pvc';

describe('Bucket policy creation of nsfs type', () => {
  before(() => {
    cy.login();
    cy.clickNavLink(['Storage', 'PersistentVolumeClaims']);
    projectNameSpace.selectOrCreateProject(DATA_FEDERATION_NAMESPACE);
    pvc.createPVC(PVC_NAME, '1', 'gp2', false);
  });

  beforeEach(() => {
    MCGMSCommon.visitBucketPolicyList();
  });

  after(() => {
    /**
     * Need some time for BucketClass to get cleaned-up properly before deleting NamespaceStore,
     * else we get an error from server: admission webhook "admissionwebhook.noobaa.io" denied the request:
     * cannot complete because nsr "e2e-nsfs-data-source" in "IN_USE" state.
     * Even though BucketClass is actually deleted, there is some deplay for it to get reflected for NamespaceStore.
     */
    cy.wait(30 * SECOND);
    cy.exec(
      `oc delete namespacestores ${DATA_SOURCE_NAME_NSFS} -n ${DATA_FEDERATION_NAMESPACE}`,
      { failOnNonZeroExit: false }
    ).then(() => {
      cy.exec(`oc delete pvc ${PVC_NAME} -n ${DATA_FEDERATION_NAMESPACE}`, {
        timeout: 3 * MINUTE,
        failOnNonZeroExit: false,
      });
    });
    cy.logout();
  });

  //   ToDo(Sanjal): Need to refactor and add more test blocks for "Multi" and "Cache" types as well.
  // right now we are only creating "nsfs"(FileSystem) type NamespaceStore which is only allowed with BucketClass of type "Single".
  it('creates Bucket policy with single data source of nsfs type', () => {
    cy.exec(
      `echo '${JSON.stringify(
        dataSourceNSFS(DATA_SOURCE_NAME_NSFS, PVC_NAME, 'e2e-subPath')
      )}' | oc create -f -`
    ).then(() => {
      BPCommon.createUsingSingleDS(SINGLE_BUCKET_POLICY, DATA_SOURCE_NAME_NSFS);
      BPCommon.confirmCreateBucket();
      BPCommon.checkBucketCreation(SINGLE_BUCKET_POLICY, DATA_SOURCE_NAME_NSFS);
    });
  });

  it('deletes created Bucket policy', () => {
    BPCommon.deleteFromDetailsPage(SINGLE_BUCKET_POLICY);
  });
});

describe('Bucket policy creation with single data source and enabled cache', () => {
  before(() => {
    cy.login();
  });

  beforeEach(() => {
    MCGMSCommon.visitBucketPolicyList();
  });

  after(() => {
    /**
     * Need some time for BucketClass to get cleaned-up properly before deleting NamespaceStore,
     * else we get an error from server: admission webhook "admissionwebhook.noobaa.io" denied the request:
     * cannot complete because nsr "-data-source" in "IN_USE" state.
     * Even though BucketClass is actually deleted, there is some deplay for it to get reflected for NamespaceStore.
     */
    cy.wait(30 * SECOND);
    deleteDataSourceResources(TEST_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
    cy.logout();
  });


  it('creates Bucket policy with single data source and enabled cache', () => {
    BPCommon.createUsingSingleDS(SINGLE_BUCKET_POLICY_WITH_CACHE, TEST_DATA_SOURCE);
    cy.log('Enable Cache');
    cy.byTestID('enable-cache-checkbox').should('be.visible').check();
    BPCommon.confirmCreateBucket();
    BPCommon.checkBucketCreation(SINGLE_BUCKET_POLICY, TEST_DATA_SOURCE);
  });

  it('deletes created Bucket policy', () => {
    BPCommon.deleteFromDetailsPage(SINGLE_BUCKET_POLICY_WITH_CACHE);
  });
});

describe('Bucket policy creation with multiple data sources', () => {
  before(() => {
    cy.login();
  });
  beforeEach(() => {
    MCGMSCommon.visitBucketPolicyList();
  });
  after(() => {
    /**
     * Need some time for BucketClass to get cleaned-up properly before deleting NamespaceStore,
     * else we get an error from server: admission webhook "admissionwebhook.noobaa.io" denied the request:
     * cannot complete because nsr "data-source" in "IN_USE" state.
     * Even though BucketClass is actually deleted, there is some deplay for it to get reflected for NamespaceStore.
     */
    cy.wait(30 * SECOND);
    deleteDataSourceResources(TEST_READ_DATA_SOURCE, DATA_FEDERATION_NAMESPACE);
    cy.logout();
  });
  it('creates Bucket policy with multiple data sources', () => {
    BPCommon.createUsingMultiDS(MULTIPLE_BUCKET_POLICY, TEST_READ_DATA_SOURCE);
    BPCommon.confirmCreateBucket();
    BPCommon.checkBucketCreation(MULTIPLE_BUCKET_POLICY, TEST_READ_DATA_SOURCE);
  });
  it('deletes created Bucket policy', () => {
    BPCommon.deleteFromDetailsPage(MULTIPLE_BUCKET_POLICY);
  });
});
