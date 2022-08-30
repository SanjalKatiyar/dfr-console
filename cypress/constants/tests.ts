// OBC
export const BUCKET_CLAIM_NAME = 'e2e-bucket-claim';

// Status card
export const STATUS_CARD_TITLE = 'Data Federation service';

// Bucket policy
export const SINGLE_BUCKET_POLICY = 'e2e-bucket-single';
export const DATA_SOURCE_NAME_AWS = 'e2e-aws-data-source';

// constants for data source test cases
export const TEST_DATA_SOURCE = 'testing-data-source';
export enum Providers {
  AWS = 'AWS S3',
  AZURE = 'Azure Blob',
  S3 = 'S3 Compatible',
  PVC = 'PVC',
  IBM = 'IBM COS',
  FILESYSTEM = 'Filesystem',
}
export const DATA_SOURCE_INPUTS = {
  name: TEST_DATA_SOURCE,
  provider: Providers.AWS,
  awsAccessKey: Cypress.env('AWS_ACCESS_KEY_ID'),
  awsSecretKey: Cypress.env('AWS_SECRET_ACCESS_KEY'),
  targetBucket: Cypress.env('AWS_SINGLE_DATA_SOURCE_BUCKET'),
  awsRegion: Cypress.env('AWS_REGION'),
};

export type secretInputs = {
  name?: string;
  ns?: string;
  accessKey?: string;
  secretKey?: string;
};

export type dataSourceInputs = {
  name?: string;
  ns?: string;
  provider?: Providers;
  secretInfo?: secretInputs;
  targetBucket?: string;
  region?: string;
};

// Helper constants.
export const AWS_CREDS_EXIST: boolean = !!(
  Cypress.env('AWS_ACCESS_KEY_ID') && Cypress.env('AWS_SECRET_ACCESS_KEY')
);
