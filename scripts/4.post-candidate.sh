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

VACANCY_ID=$1
EXPERIENCE=$2
ENGLISH=$3
TIMEZONE=$4
SALARY=$5
CANDIDATE_NAME=$6
CANDIDATE_EMAIL=$7
CANDIDATE_TELEGRAM=$8

echo
echo
echo ---------------------------------------------------------
echo "Step 1: Call 'postCandidate' functions on the contract"
echo ---------------------------------------------------------
echo

near call $CONTRACT postCandidate '{"vacancy_id": "'$VACANCY_ID'", "experience": "'${EXPERIENCE:="5+"}'", "english_level":"'${ENGLISH:="Advanced"}'", "timezone": "'${TIMEZONE:="EST"}'", "salary_expectations": "'${SALARY:="5000USD"}'", "full_name": "'${CANDIDATE_NAME:="John Galt"}'", "email": "'${CANDIDATE_EMAIL:="j.galt@gmail.com"}'", "telegram": "'${CANDIDATE_TELEGRAM:="@whoisjohn"}'" }' --accountId="'${COMPANYID}'"

echo
echo
echo ------------------------------------------------------------------------------------------------------
echo ">>>>>>>>>>>>Candidate for '$VACANCY_ID' has been added!"
echo ------------------------------------------------------------------------------------------------------

exit 0
