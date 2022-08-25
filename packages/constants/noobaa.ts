import * as _ from 'lodash-es';

export enum StoreType {
  BS = 'BackingStore',
  NS = 'NamespaceStore',
}

export enum BC_PROVIDERS {
  AWS = 'AWS S3',
  S3 = 'S3 Compatible',
  PVC = 'PVC',
  GCP = 'Google Cloud Storage',
  AZURE = 'Azure Blob',
  IBM = 'IBM COS',
  FILESYSTEM = 'Filesystem',
}

export enum BucketClassType {
  SINGLE = 'Single',
  MULTI = 'Multi',
  CACHE = 'Cache',
}

export enum PhaseType {
  READY = 'Ready',
  PROCESSING = 'Processing',
  ERROR = 'Error',
}

export enum BucketClassPhase {
  READY = 'Ready',
  VERIFYING = 'Verifying',
  CONFIGURING = 'Configuring',
  DELETING = 'Deleting',
  REJECTED = 'Rejected',
}

export const BucketClassPhaseMap: { [key: string]: string } = {
  [BucketClassPhase.READY]: PhaseType.READY as const,
  [BucketClassPhase.VERIFYING]: PhaseType.PROCESSING as const,
  [BucketClassPhase.CONFIGURING]: PhaseType.PROCESSING as const,
  [BucketClassPhase.DELETING]: PhaseType.PROCESSING as const,
  [BucketClassPhase.REJECTED]: PhaseType.ERROR as const,
};

export enum NamespaceStorePhase {
  READY = 'Ready',
  CREATING = 'Creating',
  VERIFYING = 'Verifying',
  CONNECTING = 'Connecting',
  DELETING = 'Deleting',
  REJECTED = 'Rejected',
}

export const NamespaceStorePhaseMap: { [key: string]: string } = {
  [NamespaceStorePhase.READY]: PhaseType.READY as const,
  [NamespaceStorePhase.CREATING]: PhaseType.PROCESSING as const,
  [NamespaceStorePhase.VERIFYING]: PhaseType.PROCESSING as const,
  [NamespaceStorePhase.CONNECTING]: PhaseType.PROCESSING as const,
  [NamespaceStorePhase.DELETING]: PhaseType.PROCESSING as const,
  [NamespaceStorePhase.REJECTED]: PhaseType.ERROR as const,
};

export enum ObjectBucketClaimPhase {
  BOUND = 'Bound',
  PENDING = 'Pending',
  RELEASED = 'Released',
  FAILED = 'Failed',
}

export const ObjectBucketClaimPhaseMap: { [key: string]: string } = {
  [ObjectBucketClaimPhase.BOUND]: PhaseType.READY as const,
  [ObjectBucketClaimPhase.PENDING]: PhaseType.PROCESSING as const,
  [ObjectBucketClaimPhase.RELEASED]: PhaseType.PROCESSING as const,
  [ObjectBucketClaimPhase.FAILED]: PhaseType.ERROR as const,
};

export const PROVIDERS_NOOBAA_MAP = {
  [BC_PROVIDERS.AWS]: 'awsS3' as const,
  [BC_PROVIDERS.S3]: 's3Compatible' as const,
  [BC_PROVIDERS.AZURE]: 'azureBlob' as const,
  [BC_PROVIDERS.GCP]: 'googleCloudStorage' as const,
  [BC_PROVIDERS.PVC]: 'pvPool' as const,
  [BC_PROVIDERS.IBM]: 'ibmCos' as const,
  [BC_PROVIDERS.FILESYSTEM]: 'nsfs' as const,
};

export const NS_PROVIDERS_NOOBAA_MAP = _.pick(
  PROVIDERS_NOOBAA_MAP,
  BC_PROVIDERS.AWS,
  BC_PROVIDERS.S3,
  BC_PROVIDERS.AZURE,
  BC_PROVIDERS.IBM,
  BC_PROVIDERS.FILESYSTEM
);

export const NOOBAA_TYPE_MAP = {
  [BC_PROVIDERS.AWS]: 'aws-s3' as const,
  [BC_PROVIDERS.S3]: 's3-compatible' as const,
  [BC_PROVIDERS.AZURE]: 'azure-blob' as const,
  [BC_PROVIDERS.GCP]: 'google-cloud-storage' as const,
  [BC_PROVIDERS.PVC]: 'pv-pool' as const,
  [BC_PROVIDERS.IBM]: 'ibm-cos' as const,
  [BC_PROVIDERS.FILESYSTEM]: 'nsfs' as const,
};

export const NS_NOOBAA_TYPE_MAP = _.pick(
  NOOBAA_TYPE_MAP,
  BC_PROVIDERS.AWS,
  BC_PROVIDERS.S3,
  BC_PROVIDERS.AZURE,
  BC_PROVIDERS.IBM
);

export const NOOBAA_PROVIDER_MAP = {
  [NOOBAA_TYPE_MAP[BC_PROVIDERS.AWS]]: BC_PROVIDERS.AWS as const,
  [NOOBAA_TYPE_MAP[BC_PROVIDERS.AZURE]]: BC_PROVIDERS.AZURE as const,
  [NOOBAA_TYPE_MAP[BC_PROVIDERS.S3]]: BC_PROVIDERS.S3 as const,
  [NOOBAA_TYPE_MAP[BC_PROVIDERS.IBM]]: BC_PROVIDERS.IBM as const,
  [NOOBAA_TYPE_MAP[BC_PROVIDERS.FILESYSTEM]]: BC_PROVIDERS.FILESYSTEM as const,
  [NOOBAA_TYPE_MAP[BC_PROVIDERS.GCP]]: BC_PROVIDERS.GCP as const,
  [NOOBAA_TYPE_MAP[BC_PROVIDERS.PVC]]: BC_PROVIDERS.PVC as const,
};

export const BUCKET_LABEL_NOOBAA_MAP = {
  [BC_PROVIDERS.AWS]: 'targetBucket',
  [BC_PROVIDERS.S3]: 'targetBucket',
  [BC_PROVIDERS.AZURE]: 'targetBlobContainer',
  [BC_PROVIDERS.GCP]: 'targetBucket',
  [BC_PROVIDERS.IBM]: 'targetBucket',
};

export enum NS_PROGRESS {
  READY = 'Ready',
  CREATING = 'Creating',
  REJECTED = 'Rejected',
}

export const AWS_REGIONS = [
  'us-east-1',
  'us-east-2',
  'us-west-1',
  'us-west-2',
  'ca-central-1',
  'eu-central-1',
  'eu-west-1',
  'eu-west-2',
  'eu-west-3',
  'eu-north-1',
  'ap-east-1',
  'ap-northeast-1',
  'ap-northeast-2',
  'ap-northeast-3',
  'ap-southeast-1',
  'ap-southeast-2',
  'ap-south-1',
  'me-south-1',
  'sa-east-1',
];

export const CACHE_ANN = 'mcgms-cache-enabled';
export const OBC_NS_ANN = 'mcgms-obc-namespace';

export const DEFAULT_TTL = 3600;
export const DEFAULT_BACKING_STORE = 'noobaa-default-backing-store';
export const BS_ANN = 'default-backing-store';
// If BucketClass is of type Cache, UI needs to show this instead
export const SINGLE_WITH_CACHE = 'Single (cache enabled)';
