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

[ -z "$CANDIDATE_ID" ] && echo "Missing \$CANDIDATE_ID environment variable" && exit 1
[ -z "$CANDIDATE_ID" ] || echo "Found it! \$CANDIDATE_ID is set to [ $CANDIDATE_ID ]"

echo
echo
echo ---------------------------------------------------------
echo "Step 1: Call 'postCandidate' functions on the contract"
echo ---------------------------------------------------------
echo

near call $CONTRACT hireCandidate '{"poolName": "'${POOL:="BE developers"}'", "candidateId": "'$CANDIDATE_ID'", "vacancyId":"'$VACANCY_ID'"}' --accountId="cert.somix11.testnet" --gas 75000000000000

echo
echo

exit 0
