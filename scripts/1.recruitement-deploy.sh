#!/usr/bin/env bash

# exit on first error after this point to avoid redeploying with successful build
set -e

echo
echo ---------------------------------------------------------
echo "Step 1: Build the contract (may take a few seconds)"
echo ---------------------------------------------------------
echo

yarn build

echo
echo
echo ---------------------------------------------------------
echo "Step 2: Deploy the contract"
echo
echo "(edit scripts/1.dev-deploy.sh to deploy other contract)"
echo ---------------------------------------------------------
echo

near deploy $CONTRACT ./build/debug/recruitment.wasm

echo
echo
echo ---------------------------------------------------------
echo "Step 3: Prepare your environment for next steps"
echo
echo "(a) set an environment variable using target account name"
echo "    see example below (this may not work on Windows)"
echo
echo ---------------------------------------------------------
echo 'export CONTRACT=<dev-123-456>'
echo ---------------------------------------------------------
echo

exit 0
