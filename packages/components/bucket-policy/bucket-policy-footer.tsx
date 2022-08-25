import * as React from 'react';
import * as _ from 'lodash-es';
import { ActionGroup, Button } from '@patternfly/react-core';
import { BucketClassType } from '../../constants';
import { ButtonBar } from '../../utils/generics/ButtonBar';
import { useCustomTranslation } from '../../utils/hooks/useCustomTranslationHook';
import { BucketPolicyState } from './state';

const checkRequiredValues = (state: BucketPolicyState) =>
  !!state.bucketName?.trim() &&
  !!state.obcNamespace &&
  (state.dataResourceType === BucketClassType.SINGLE
    ? !!state.readWriteSingle
    : !!state.writeResourceMulti && !_.isEmpty(state.readResourceMulti));

export const BucketPolicyFooter: React.FC<BucketPolicyFooterProps> = ({
  state,
  loaded,
  error,
  onCancel,
  onConfirm,
}) => {
  const { t } = useCustomTranslation();

  return (
    <ButtonBar errorMessage={state.errorMessage} inProgress={state.inProgress}>
      <ActionGroup className="pf-c-form pf-c-form__actions--left">
        <Button
          type="button"
          variant="primary"
          data-test="confirm-action-bucket"
          onClick={onConfirm}
          isDisabled={!checkRequiredValues(state) || !loaded || !!error}
        >
          {t('Create')}
        </Button>
        <Button
          type="button"
          variant="secondary"
          data-test="cancel-action-bucket"
          onClick={onCancel}
        >
          {t('Cancel')}
        </Button>
      </ActionGroup>
    </ButtonBar>
  );
};

type BucketPolicyFooterProps = {
  state: BucketPolicyState;
  loaded: boolean;
  error: any;
  onCancel: () => void;
  onConfirm: () => void;
};
