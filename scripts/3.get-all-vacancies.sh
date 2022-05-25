#!/usr/bin/env bash

# exit on first error after this point to avoid redeploying with successful build
set -e

echo
echo ---------------------------------------------------------
echo "Step 0: Check for environment variable with contract name"
echo ---------------------------------------------------------
echo

[ -z "$CONTRACT" ] && echo "Missing \$CONTRACT environment variable" && exit 1
[ -z "$CONTRACT" ] || echo "Found it! \$CONTRACT is set to [ $CONTRACT ]"

POOL=$1

echo
echo
echo ---------------------------------------------------------
echo "Step 1: Call 'getAllVacancies' functions on the contract"
echo ---------------------------------------------------------
echo

near view $CONTRACT getAllVacancies '{"poolName": "'${POOL:="developers"}'"}'

echo
echo

exit 0
