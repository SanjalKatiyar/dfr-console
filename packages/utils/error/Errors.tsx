import * as React from 'react';
import { Helmet } from 'react-helmet';
import PageHeading from '../heading/page-heading';
import { useCustomTranslation } from '../hooks/useCustomTranslationHook';

export type ErrorComponentProps = {
  title: string;
  message?: string;
};

const ErrorComponent: React.SFC<ErrorComponentProps> = ({ title, message }) => {
  const { t } = useCustomTranslation('plugin__mcg-ms-console');
  return (
    <>
      <PageHeading title={t('Error')} />
      <div className="co-m-pane__body" data-test="error-page">
        <PageHeading title={title} centerText />
        {message && <div className="pf-u-text-align-center">{message}</div>}
      </div>
    </>
  );
};

type ErrorPageProps = {
  message: string;
};

export const ErrorPage: React.FC<ErrorPageProps> = ({ message }) => {
  const { t } = useCustomTranslation('plugin__mcg-ms-console');
  return (
    <div>
      <Helmet>
        <title>{t('Error')}</title>
      </Helmet>
      <ErrorComponent
        title={t('Oh no! Something went wrong.')}
        message={message}
      />
    </div>
  );
};
