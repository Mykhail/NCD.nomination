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

[ -z "$VACANCY_ID" ] && echo "Missing \$VACANCY_ID environment variable" && exit 1
[ -z "$VACANCY_ID" ] || echo "Found it! \$VACANCY_ID is set to [ $VACANCY_ID ]"

echo
echo
echo ---------------------------------------------------------
echo "Step 1: Call 'getHiredCandidates' functions on the contract"
echo ---------------------------------------------------------
echo

near view $CONTRACT getHiredCandidates '{"vacancyId": "'$VACANCY_ID'"}' --accountId="cert.somix11.testnet"

echo
echo

exit 0
