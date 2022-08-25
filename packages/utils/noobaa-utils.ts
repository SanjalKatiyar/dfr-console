import { RowFilter } from '@openshift-console/dynamic-plugin-sdk';
import { EventKind } from '@openshift-console/dynamic-plugin-sdk/lib/api/internal-types';
import * as _ from 'lodash-es';
import {
  AWS_REGIONS,
  BC_PROVIDERS,
  PROVIDERS_NOOBAA_MAP,
  StoreType,
  BucketClassType,
} from '../constants';
import {
  SecretModel,
  NooBaaBucketClassModel,
  NooBaaNamespaceStoreModel,
  NooBaaObjectBucketClaimModel,
  PersistentVolumeClaimModel,
  PersistentVolumeModel,
} from '../models';
import {
  DeploymentKind,
  K8sResourceKind,
  NamespaceStoreKind,
  BucketClassKind,
  SingleBC,
  MultiBC,
  CacheBC,
} from '../types';
import { getAPIVersion } from './selectors/k8s';

export const awsRegionItems = _.zipObject(AWS_REGIONS, AWS_REGIONS);
export const endpointsSupported = [BC_PROVIDERS.S3, BC_PROVIDERS.IBM];
export const getProviders = (type: StoreType) => {
  const values =
    type === StoreType.BS
      ? // BackingStore does not support filesystem, NamespaceStore does not support PVC and GCP
        Object.values(BC_PROVIDERS).filter(
          (provider) => provider !== BC_PROVIDERS.FILESYSTEM
        )
      : Object.values(BC_PROVIDERS).filter(
          (provider) =>
            provider !== BC_PROVIDERS.GCP && provider !== BC_PROVIDERS.PVC
        );
  return _.zipObject(values, values);
};

export const getExternalProviders = (type: StoreType) => {
  return type === StoreType.NS
    ? [BC_PROVIDERS.AWS, BC_PROVIDERS.AZURE, BC_PROVIDERS.S3, BC_PROVIDERS.IBM]
    : [
        BC_PROVIDERS.AWS,
        BC_PROVIDERS.AZURE,
        BC_PROVIDERS.S3,
        BC_PROVIDERS.GCP,
        BC_PROVIDERS.IBM,
      ];
};

export const getAttachOBCPatch = (
  obcName: string,
  deployment: DeploymentKind
) => {
  const configMapRef = {
    configMapRef: {
      name: obcName,
    },
  };
  const secretMapRef = {
    secretRef: {
      name: obcName,
    },
  };

  const containers = deployment?.spec?.template?.spec?.containers ?? [];
  const patches = containers.reduce((patch, container, i) => {
    if (_.isEmpty(container.envFrom)) {
      patch.push({
        op: 'add',
        path: `/spec/template/spec/containers/${i}/envFrom`,
        value: [configMapRef],
      });
      patch.push({
        op: 'add',
        path: `/spec/template/spec/containers/${i}/envFrom/-`,
        value: secretMapRef,
      });
    } else {
      patch.push({
        op: 'add',
        path: `/spec/template/spec/containers/${i}/envFrom/-`,
        value: configMapRef,
      });
      patch.push({
        op: 'add',
        path: `/spec/template/spec/containers/${i}/envFrom/-`,
        value: secretMapRef,
      });
    }
    return patch;
  }, []);
  return patches;
};

export const getPhase = (obj: K8sResourceKind): string => {
  return _.get(obj, 'status.phase', 'Lost');
};

export const isBound = (obj: K8sResourceKind): boolean =>
  getPhase(obj) === 'Bound';

const allPhases = ['Pending', 'Bound', 'Lost'];

export const obcStatusFilter = (t): RowFilter<K8sResourceKind> => ({
  type: 'obc-status',
  filterGroupName: t('plugin__mcg-ms-console~Status'),
  reducer: getPhase,
  items: _.map(allPhases, (phase) => ({
    id: phase,
    title: phase,
  })),
  filter: (phases, obc) => {
    if (!phases || !phases.selected) {
      return true;
    }
    const phase = getPhase(obc);
    return (
      phases.selected.includes(phase) ||
      !_.includes(phases.all, phase) ||
      _.isEmpty(phases.selected)
    );
  },
});

export const obStatusFilter = (t): RowFilter<K8sResourceKind> => ({
  type: 'ob-status',
  filterGroupName: t('plugin__mcg-ms-console~Status'),
  reducer: getPhase,
  items: _.map(allPhases, (phase) => ({
    id: phase,
    title: phase,
  })),
  filter: (phases, ob) => {
    if (!phases || !phases.selected) {
      return true;
    }
    const phase = getPhase(ob);
    return (
      phases.selected.includes(phase) ||
      !_.includes(phases.all, phase) ||
      _.isEmpty(phases.selected)
    );
  },
});

export const getMCGStoreType = (bs: NamespaceStoreKind): BC_PROVIDERS => {
  let type: BC_PROVIDERS = null;
  _.forEach(PROVIDERS_NOOBAA_MAP, (v, k) => {
    if (bs?.spec?.[v]) {
      type = k as BC_PROVIDERS;
    }
  });
  return type;
};

export const getRegion = (bs: NamespaceStoreKind): string => {
  const type = getMCGStoreType(bs);
  return bs.spec?.[PROVIDERS_NOOBAA_MAP[type]]?.region;
};

// DataResouce is an alias for NamespaceStore in DF.
export const getDataResources = (obj: BucketClassKind): string[] => {
  const type = obj?.spec?.namespacePolicy?.type;
  const resourseList = [];
  if (type === BucketClassType.SINGLE) {
    resourseList.push(
      (obj?.spec?.namespacePolicy as SingleBC)?.single?.resource
    );
  } else if (type === BucketClassType.CACHE) {
    resourseList.push(
      (obj?.spec?.namespacePolicy as CacheBC)?.cache?.hubResource
    );
  } else if (type === BucketClassType.MULTI) {
    resourseList.push(
      ...(obj?.spec?.namespacePolicy as MultiBC)?.multi?.readResources
    );
  }
  return resourseList;
};

export const isObjectStorageEvent = (event: EventKind): boolean => {
  const eventKind: string = event?.involvedObject?.kind;
  const objectStorageResources = [
    NooBaaBucketClassModel.kind,
    NooBaaObjectBucketClaimModel.kind,
    NooBaaNamespaceStoreModel.kind,
  ];
  if (
    eventKind !== PersistentVolumeClaimModel.kind &&
    eventKind !== PersistentVolumeModel.kind
  ) {
    const eventName: string = event?.involvedObject?.name;
    return _.startsWith(eventName, 'noobaa');
  }
  return objectStorageResources.includes(eventKind);
};

export const secretPayloadCreator = (
  provider: string,
  namespace: string,
  secretName: string,
  field1: string,
  field2 = ''
) => {
  const payload = {
    apiVersion: getAPIVersion(SecretModel),
    kind: SecretModel.kind,
    stringData: {},
    metadata: {
      name: secretName,
      namespace,
    },
    type: 'Opaque',
  };

  switch (provider) {
    case BC_PROVIDERS.AZURE:
      payload.stringData = {
        AccountName: field1,
        AccountKey: field2,
      };
      break;
    case BC_PROVIDERS.IBM:
      payload.stringData = {
        IBM_COS_ACCESS_KEY_ID: field1,
        IBM_COS_SECRET_ACCESS_KEY: field2,
      };
      break;
    default:
      payload.stringData = {
        AWS_ACCESS_KEY_ID: field1,
        AWS_SECRET_ACCESS_KEY: field2,
      };
      break;
  }
  return payload;
};
