#!/usr/bin/env bash

set -eExuo pipefail

NAMESPACE=""        # TODO
DF_CONSOLE_IMAGE="" # TODO

function generateLogsAndCopyArtifacts {
  oc cluster-info dump >"${ARTIFACT_DIR}"/cluster_info.json
  oc get secrets -A -o yaml >>"${ARTIFACT_DIR}"/secrets.yaml
  oc get catalogsource -A -o yaml >>"${ARTIFACT_DIR}"/catalogsource.yaml
  oc get subscriptions -n "$NAMESPACE" -o yaml >>"${ARTIFACT_DIR}"/subscription_details.yaml
  oc get csvs -n "$NAMESPACE" -o yaml >>"${ARTIFACT_DIR}"/csvs.yaml
  oc get deployments -n "$NAMESPACE" -o yaml >>"${ARTIFACT_DIR}"/deployment_details.yaml
  oc get installplan -n "$NAMESPACE" -o yaml >>"${ARTIFACT_DIR}"/installplan.yaml
  oc get nodes -o yaml >>"${ARTIFACT_DIR}"/node.yaml
  oc get pods -n "$NAMESPACE" -o yaml >>"${ARTIFACT_DIR}"/pod_details_"$NAMESPACE".yaml
  for pod in $(oc get pods -n "$NAMESPACE" --no-headers -o custom-columns=":metadata.name" | grep "df-console"); do
    echo "$pod"
    oc logs "$pod" -n "$NAMESPACE" >"${ARTIFACT_DIR}"/"${pod}".log
  done
  oc get serviceaccounts -n "$NAMESPACE" -o yaml >>"${ARTIFACT_DIR}"/serviceaccount.yaml
  oc get console.v1.operator.openshift.io cluster -o yaml >>"${ARTIFACT_DIR}"/cluster.yaml

  if [ -d "$ARTIFACT_DIR" ] && [ -d "$SCREENSHOTS_DIR" ]; then
    if [[ -z "$(ls -A -- "$SCREENSHOTS_DIR")" ]]; then
      echo "No artifacts were copied."
    else
      echo "Copying artifacts from $(pwd)..."
      cp -r "$SCREENSHOTS_DIR" "${ARTIFACT_DIR}/gui-test-screenshots"
    fi
  fi
}

trap generateLogsAndCopyArtifacts EXIT
trap generateLogsAndCopyArtifacts ERR

PULL_SECRET_PATH="/var/run/operator-secret/dockerconfig"
SECRET_NAME="df-secret"
ARTIFACT_DIR=${ARTIFACT_DIR:=/tmp/artifacts}
SCREENSHOTS_DIR=gui-test-screenshots

function createSecret {
  oc create secret generic "${SECRET_NAME}" --from-file=.dockerconfigjson=${PULL_SECRET_PATH} --type=kubernetes.io/dockerconfigjson -n "$1"
}

function linkSecrets {
  for serviceAccount in $(oc get serviceaccounts -n "$NAMESPACE" --no-headers -o custom-columns=":metadata.name" | sed 's/"//g'); do
    echo "Linking ${SECRET_NAME} to ${serviceAccount}"
    oc secrets link "${serviceAccount}" "${SECRET_NAME}" -n "$NAMESPACE" --for=pull
  done
}

function deleteAllPods {
  oc delete pods --all -n "$1"
}

oc patch operatorhub.config.openshift.io/cluster -p='{"spec":{"sources":[{"disabled":true,"name":"redhat-operators"}]}}' --type=merge

echo "Creating secret for CI builds in ${NAMESPACE}"
createSecret ${NAMESPACE}
oc apply -f openshift-ci/df-catalog-source.yaml

echo "Waiting for CatalogSource to be Ready"
# Have to sleep here for atleast 1 min to ensure catalog source is in stable READY state
sleep 60

echo "Creating secret for linking pods"
createSecret "$NAMESPACE"

echo "Adding secret to all service accounts in \"$NAMESPACE\" namespace"
linkSecrets

echo "Restarting pods for secret update"
deleteAllPods "$NAMESPACE"
sleep 30

echo "Adding secret to all service accounts in \"$NAMESPACE\" namespace"
linkSecrets

echo "Restarting pods for secret update"
deleteAllPods "$NAMESPACE"
sleep 120

echo "Adding secret to all service accounts in \"$NAMESPACE\" namespace"
linkSecrets

echo "Restarting pods for secret update"
deleteAllPods "$NAMESPACE"

echo "Adding secret to all service accounts in \"$NAMESPACE\" namespace"
linkSecrets

echo "Restarting pods for secret update"
deleteAllPods "$NAMESPACE"
sleep 120

# Enable console plugin for DF-Console
export CONSOLE_CONFIG_NAME="cluster"
export DF_PLUGIN_NAME="df-console"

DF_CSV_NAME="$(oc get csv -n "$NAMESPACE" -o=jsonpath='{.items[?(@.spec.displayName=="OpenShift Data Foundation")].metadata.name}')"
export DF_CSV_NAME

oc patch csv "${DF_CSV_NAME}" -n "$NAMESPACE" --type='json' -p \
  "[{'op': 'replace', 'path': '/spec/install/spec/deployments/1/spec/template/spec/containers/0/image', 'value': \"${DF_CONSOLE_IMAGE}\"}]"

# Installation occurs.
# This is also the default case if the CSV is in "Installing" state initially.
timeout 15m bash <<-'EOF'
echo "waiting for ${DF_CSV_NAME} clusterserviceversion to succeed"
until [ "$(oc -n "$NAMESPACE" get csv -o=jsonpath="{.items[?(@.metadata.name==\"${DF_CSV_NAME}\")].status.phase}")" == "Succeeded" ]; do
  sleep 1
done
EOF

INSTALLER_DIR=${INSTALLER_DIR:=${ARTIFACT_DIR}/installer}

BRIDGE_KUBEADMIN_PASSWORD="$(cat "${KUBEADMIN_PASSWORD_FILE:-${INSTALLER_DIR}/auth/kubeadmin-password}")"
export BRIDGE_KUBEADMIN_PASSWORD
BRIDGE_BASE_ADDRESS="$(oc get consoles.config.openshift.io cluster -o jsonpath='{.status.consoleURL}')"
export BRIDGE_BASE_ADDRESS

# Disable color codes in Cypress since they do not render well CI test logs.
# https://docs.cypress.io/guides/guides/continuous-integration.html#Colors
export NO_COLOR=1

# Install dependencies.
yarn install

# Run tests.
yarn run test-cypress-headless

# Generate Cypress report.
yarn run cypress-postreport
