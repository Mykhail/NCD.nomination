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

echo
echo
echo ---------------------------------------------------------
echo "Step 1: Call 'postVacancy' functions on the contract"
echo ---------------------------------------------------------
echo

near call $CONTRACT postVacancy '{"pool": "'${POOL:="BE developers"}'", "title": "'${TITLE:="BE Senior"}'", "experience":"'${EXPERIENCE:="5+"}'", "english": "'${ENGLISH:="Advanced"}'", "timezone": "'${TIMEZONE:="EST"}'", "company_id": "'${COMPANYID:="somix11.testnet"}'" }' --accountId=${COMPANYID:="somix11.testnet"} --amount 1

echo
echo
echo ------------------------------------------------------------------------------------------------------
echo ">>>>>>>>>>>>Vacancy for '${TITLE:="BE Senior"}' has been posted by '${COMPANYID:="somix11.testnet"}'"
echo ------------------------------------------------------------------------------------------------------

exit 0
