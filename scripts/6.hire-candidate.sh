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

[ -z "$COMPANYID" ] && echo "Missing \$COMPANYID environment variable, please use export COMPANYID=<YOUR_NEAR_ACCOUNT>" && exit 1
[ -z "$COMPANYID" ] || echo "Found it! \$COMPANYID is set to [ $COMPANYID ]"

[ -z "$1" ] && echo "Missing parametr \$VACANCY_ID" && exit 1
[ -z "$1" ] || echo "Found it! \$VACANCY_ID is set to [ $VACANCY_ID ]"

[ -z "$1" ] && echo "Missing parametr \$CANDIDATE_ID" && exit 1
[ -z "$1" ] || echo "Found it! \$CANDIDATE_ID is set to [ $CANDIDATE_ID ]"

CANDIDATE_ID=$1
VACANCY_ID=$2
POOL=$3

echo
echo
echo ---------------------------------------------------------
echo "Step 1: Call 'hireCandidate' functions on the contract"
echo ---------------------------------------------------------
echo

near call $CONTRACT hireCandidate '{"poolName": "'${POOL:="developers"}'", "candidateId": "'$CANDIDATE_ID'", "vacancyId":"'$VACANCY_ID'"}' --accountId="'${COMPANYID}'" --gas 75000000000000

echo
echo

exit 0
