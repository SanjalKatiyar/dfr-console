#!/usr/bin/env bash

# This script is used to satisfy operator pre-requisites in CI and local environments.

# -e: Exit immediately if a pipeline, a list, or a compound command, exits with a non-zero status.
# -E: If any command in a pipeline errors, the entire pipeline exits with a non-zero status.
# -x: Print each command before it is executed.
# -u: Treat unset variables as an error when substituting.
# -o pipefail: If any command in a pipeline fails, the entire pipeline fails.
set -eExuo pipefail

export MCG_DISPLAY_NAME="MCG OSD Deployer"

# Check if the addon is already successfully installed.
if [[ $(oc get csv -n redhat-data-federation | grep -c mcg-osd-deployer) -gt 0 ]]; then
    timeout 3m bash <<-'EOF'
     until [[ $(oc get csv -n redhat-data-federation -o=jsonpath="{.items[?(@.spec.displayName==\"${MCG_DISPLAY_NAME}\")].status.phase}") == "Succeeded" ]]; do
         echo "Waiting for ${MCG_DISPLAY_NAME} to reach succeeded state"
         sleep 5
     done
EOF
    exit 0
fi

function installMCGAddon {
    declare -a resources=() # Recent BASH change, refer https://stackoverflow.com/a/28058737.
    resources=("namespace" "secrets" "operatorgroup" "catalogsource" "subscription")
    for resource in "${resources[@]}"; do
        oc create -f "https://raw.githubusercontent.com/red-hat-storage/mcg-osd-deployer/main/hack/deploy/${resource}.yaml"
    done
}

# Fetch and create the required resources from the upstream project.
installMCGAddon

MCG_PLUGIN_NAME="mcg-ms-console"
MCG_CONSOLE_IMAGE="${MCG_PLUGIN_NAME}"

# Wait until the operator CSV exists.
timeout 2m bash <<-'EOF'
until [[ $(oc get csv -n redhat-data-federation | grep mcg-osd-deployer | wc -l) -gt 0 ]]; do
    echo "Waiting for ${MCG_DISPLAY_NAME} to exist..."
    sleep 5
done
EOF

# Fetch the operator CSV name.
MCG_CSV_NAME="$(oc get csv -n redhat-data-federation -o=jsonpath="{.items[?(@.spec.displayName==\"${MCG_DISPLAY_NAME}\")].metadata.name}")"
export MCG_CSV_NAME

# Check if the CSV installation succeeded.
timeout 10m bash <<-'EOF'
until [ "$(oc get csv -n redhat-data-federation -o=jsonpath="{.items[?(@.metadata.name==\"${MCG_CSV_NAME}\")].status.phase}")" == "Succeeded" ]; do
    echo "Waiting for ${MCG_CSV_NAME} to reach succeeded state..."
    sleep 5
done
EOF

# Enable console plugin for the MCG addon.
oc patch console.v1.operator.openshift.io cluster --type=json -p="[{'op': 'add', 'path': '/spec/plugins', 'value':[\"${MCG_PLUGIN_NAME}\"]}]"

# Don't run in a local environment.
if [[ -n "${OPENSHIFT_CI}" ]]; then
    # Use the appropriate image for the MCG console plugin.
    oc patch csv "${MCG_CSV_NAME}" -n redhat-data-federation --type='json' -p \
        "[{'op': 'replace', 'path': '/spec/install/spec/deployments/1/spec/template/spec/containers/0/image', 'value': \"${MCG_CONSOLE_IMAGE}\"}]"
fi

sleep 10m # [Debug]
