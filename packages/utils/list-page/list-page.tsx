import * as React from 'react';
import {
  K8sResourceCommon,
  ListPageBody,
  ListPageCreateLink,
  ListPageFilter,
  TableColumn,
  useActiveColumns,
  useK8sWatchResource,
  useListPageFilter,
  VirtualizedTable,
  RowProps,
} from '@openshift-console/dynamic-plugin-sdk';
import { K8sModel } from '@openshift-console/dynamic-plugin-sdk/lib/api/common-types';
import * as _ from 'lodash';
import { referenceForModel } from '..';
import { DATA_FEDERATION_NAMESPACE } from '../../constants';
import { useCustomTranslation } from '../hooks/useCustomTranslationHook';
import { CustomKebabItemsType } from '../kebab/kebab';
import {
  LaunchModal,
  ModalMap,
  useModalLauncher,
} from '../modals/modalLauncher';
import './list-view.scss';

const ResourceTable: React.FC<ResourceTableProps> = ({
  tableColumns,
  resourceModel,
  children,
  ...props
}) => {
  const { t } = useCustomTranslation();

  const [columns] = useActiveColumns({
    columns: tableColumns,
    showNamespaceOverride: false,
    columnManagementID: null,
  });

  return (
    <VirtualizedTable
      {...props}
      aria-label={t('Resource Page')}
      columns={columns}
      Row={
        children as React.ComponentType<RowProps<K8sResourceCommon, CustomData>>
      }
    />
  );
};

export const GenericListPage: React.FC<GenericListPageProps> = ({
  actions,
  resourceModel,
  kebabActions,
  resourceMap,
  tableColumns,
  createButtonTitle,
  children,
}) => {
  const { t } = useCustomTranslation();
  const [Modal, modalProps, launchModal] = useModalLauncher(actions);

  const resource = React.useMemo(
    () => ({
      kind: referenceForModel(resourceModel),
      namespace: DATA_FEDERATION_NAMESPACE,
      isList: true,
    }),
    [resourceModel]
  );

  const [resources, loaded, error] =
    useK8sWatchResource<K8sResourceCommon[]>(resource);
  const [data, filteredData, onFilterChange] = useListPageFilter(resources);
  const createLink = `/mcgms/resource/${referenceForModel(
    resourceModel
  )}/create/~new`;

  return (
    <>
      <Modal {...modalProps} />
      <div>
        <div className="filter-data-resource__search-box">
          <ListPageFilter
            data={data}
            loaded={loaded}
            onFilterChange={onFilterChange}
            hideColumnManagement={true}
            nameFilterPlaceholder={t('Filter by name')}
            labelFilterPlaceholder={t('Filter by label')}
          />
        </div>
        <div className="create-resource__button">
          <ListPageCreateLink to={createLink}>
            {createButtonTitle || t('Create resource')}
          </ListPageCreateLink>
        </div>
      </div>
      <ListPageBody>
        <ResourceTable
          data={filteredData}
          unfilteredData={data}
          loaded={loaded}
          loadError={error}
          rowData={{
            launchModal,
            kebabActions,
            resourceMap,
          }}
          tableColumns={tableColumns}
          resourceModel={resourceModel}
        >
          {children}
        </ResourceTable>
      </ListPageBody>
    </>
  );
};

type GenericListPageProps = {
  actions?: ModalMap;
  resourceModel: K8sModel;
  kebabActions?: CustomKebabItemsType;
  resourceMap?: { [key: string]: any };
  createButtonTitle?: string;
  tableColumns: TableColumn<K8sResourceCommon>[];
  children: React.ReactNode;
};

type ResourceTableProps = {
  data: K8sResourceCommon[];
  unfilteredData: K8sResourceCommon[];
  loaded: boolean;
  loadError: any;
  rowData: CustomData;
  tableColumns: TableColumn<K8sResourceCommon>[];
  resourceModel: K8sModel;
  children: React.ReactNode;
};

type CustomData = {
  launchModal: LaunchModal;
  kebabActions?: CustomKebabItemsType;
  resourceMap: { [key: string]: any };
};
