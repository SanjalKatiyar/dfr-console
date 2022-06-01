#!/usr/bin/env bash

set -eExuo pipefail

function fetchManifests {
    resources=("namespace" "secrets" "operatorgroup" "catalogsource")
    for resource in "${resources[@]}"; do
        oc create -f "https://raw.githubusercontent.com/red-hat-storage/mcg-osd-deployer/main/hack/deploy/${resource}.yaml"
    done
}

fetchManifests

NAMESPACE="redhat-data-federation"

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
    for pod in $(oc get pods -n "$NAMESPACE" --no-headers -o custom-columns=":metadata.name" | grep "mcg-ms-console"); do
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

ARTIFACT_DIR=${ARTIFACT_DIR:=/tmp/artifacts}
SCREENSHOTS_DIR=gui-test-screenshots

# Enable console plugin for mcg-ms-console
export CONSOLE_CONFIG_NAME="cluster"
export MCG_OSD_PLUGIN_NAME="mcg-ms-console"

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
# `cy.install` will be responsible for:
# - pointing the CSV to the newly built mcg-ms-console PR's image
# - checking and proceeding only if the CSV is in "Succeeded" state
yarn run test-cypress-headless

# Generate Cypress report.
yarn run cypress-postreport
