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

POOL=$1
TITLE=$2
EXPERIENCE=$3
ENGLISH=$4
TIMEZONE=$5
DEPOSIT=$6

echo
echo
echo ---------------------------------------------------------
echo "Step 1: Call 'postVacancy' functions on the contract"
echo ---------------------------------------------------------
echo

near call $CONTRACT postVacancy '{"pool": "'${POOL:="developers"}'", "title": "'${TITLE:="BE Senior"}'", "experience":"'${EXPERIENCE:="5+"}'", "english": "'${ENGLISH:="Advanced"}'", "timezone": "'${TIMEZONE:="EST"}'", "company_id": "'${COMPANYID}'" }' --accountId=${COMPANYID} --amount ${DEPOSIT:="1"}

echo
echo
echo ------------------------------------------------------------------------------------------------------
echo ">>>>>>>>>>>>Vacancy for '${TITLE:="BE Senior"}' has been posted by '${COMPANYID}'"
echo ------------------------------------------------------------------------------------------------------

exit 0


