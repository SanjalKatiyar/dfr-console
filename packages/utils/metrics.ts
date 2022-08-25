import { PrometheusResponse } from '@openshift-console/dynamic-plugin-sdk';
import * as _ from 'lodash-es';

export const getMetric = (result: PrometheusResponse, metric: string): string =>
  _.get(result, ['data', 'result', '0', 'metric', metric], null);

export const getGaugeValue = (response: PrometheusResponse) =>
  response?.data?.result?.[0]?.value?.[1];

export const getResiliencyProgress = (results: PrometheusResponse): number => {
  /**
   * Possible values for progress:
   *   - A float value of String type
   *   - 'NaN'
   *   - undefined
   */
  const progress: string = getGaugeValue(results);
  return parseFloat(progress);
};
