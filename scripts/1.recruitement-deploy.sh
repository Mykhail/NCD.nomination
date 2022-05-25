#!/usr/bin/env bash

# exit on first error after this point to avoid redeploying with successful build
set -e

echo
echo ---------------------------------------------------------
echo "Step 0: Check for environment variable with contract name"
echo ---------------------------------------------------------
echo

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable"
[ -z "$CONTRACT" ] || echo "Found it! \$CONTRACT is set to [ $CONTRACT ]"

echo
echo ---------------------------------------------------------
echo "Step 1: Build the contract (may take a few seconds)"
echo ---------------------------------------------------------
echo

yarn build

echo
echo ---------------------------------------------------------
echo "Step 2: Deploy the contract"
echo
echo 
echo ---------------------------------------------------------
echo

near dev-deploy $CONTRACT ./build/debug/recruitment.wasm

echo
echo
echo ---------------------------------------------------------
echo "Step 3: Prepare your environment for the next steps"
echo
echo run the following commands
echo 'export CONTRACT=<dev-123-456>'
echo 'export COMPANYID=<your own account>'
echo
echo ---------------------------------------------------------
echo
echo

exit 0
