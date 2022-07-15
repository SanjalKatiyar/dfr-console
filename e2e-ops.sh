#!/usr/bin/env bash

# This script is used to satisfy operator pre-requisites in CI and local environments.

# -e: Exit immediately if a pipeline, a list, or a compound command, exits with a non-zero status.
# -E: If any command in a pipeline errors, the entire pipeline exits with a non-zero status.
# -x: Print each command before it is executed.
# -u: Treat unset variables as an error when substituting.
# -o pipefail: If any command in a pipeline fails, the entire pipeline fails.
set -eExuo pipefail

function installMCGAddon {
    declare -a resources=() # Recent BASH change, refer https://stackoverflow.com/a/28058737.
    resources=("namespace" "secrets" "operatorgroup" "catalogsource" "subscription")
    for resource in "${resources[@]}"; do
        oc create -f "https://raw.githubusercontent.com/red-hat-storage/mcg-osd-deployer/main/hack/deploy/${resource}.yaml"
    done
}
function waitUntilCSVExists {
    until [[ $(oc get csv -n redhat-data-federation | grep -c "$1") -gt 0 ]]; do
        echo "Waiting for $1 to exist..."
        sleep 5
    done
}
function waitUntilCSVIsReady {
    until [[ $(oc get csv -n redhat-data-federation -o=jsonpath="{.items[?(@.spec.displayName==\"$1\")].status.phase}") == "Succeeded" ]]; do
        echo "Waiting for $1 to reach succeeded state..."
        sleep 5
    done
}

export -f waitUntilCSVExists waitUntilCSVIsReady
export MCG_DISPLAY_NAME="MCG OSD Deployer"
# Check if the addon is already successfully installed.
if [[ $(oc get csv -n redhat-data-federation | grep -c mcg-osd-deployer) -gt 0 ]]; then
    timeout 10m bash -c "waitUntilCSVIsReady \"${MCG_DISPLAY_NAME}\""
    exit 0
fi

# Fetch and create the required resources from the upstream project.
installMCGAddon

# Wait until the operator CSV exists.
timeout 10m bash -c "waitUntilCSVExists \"${MCG_DISPLAY_NAME}\""
# Check if the CSV installation succeeded.
timeout 10m bash -c "waitUntilCSVIsReady \"${MCG_DISPLAY_NAME}\""

# Don't run in a local environment.
: ${OPENSHIFT_CI:=}
if [[ -n "${OPENSHIFT_CI}" ]]; then
    # Fetch the operator CSV name.
    MCG_CSV_NAME="$(oc get csv -n redhat-data-federation -o=jsonpath="{.items[?(@.spec.displayName==\"${MCG_DISPLAY_NAME}\")].metadata.name}")"
    # Use the appropriate image for the MCG console plugin.
    MCG_CONSOLE_IMAGE="$1"
    oc patch csv "${MCG_CSV_NAME}" -n redhat-data-federation --type='json' -p \
        "[{'op': 'replace', 'path': '/spec/install/spec/deployments/1/spec/template/spec/containers/0/image', 'value': \"${MCG_CONSOLE_IMAGE}\"}]"
    sleep 10
    timeout 10m bash -c "waitUntilCSVIsReady \"${MCG_DISPLAY_NAME}\""
fi
