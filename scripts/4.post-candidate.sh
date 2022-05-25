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
echo "Step 1: Call 'postCandidate' functions on the contract"
echo ---------------------------------------------------------
echo

near call $CONTRACT postCandidate '{"vacancy_id": "'$VACANCY_ID'", "experience": "'${EXPERIENCE:="5+"}'", "english_level":"'${ENGLISH:="Advanced"}'", "timezone": "'${TIMEZONE:="EST"}'", "salary_expectations": "'${SALARY:="5000USD"}'", "full_name": "'${CANDIDATE_NAME:="John Galt"}'", "email": "'${CANDIDATE_EMAIL:="j.galt@gmail.com"}'", "telegram": "'${CANDIDATE_TELEGRAM:="@whoisjohn"}'" }' --accountId="cert.somix11.testnet"

echo
echo
echo ------------------------------------------------------------------------------------------------------
echo ">>>>>>>>>>>>Candidate for '$VACANCY_ID' has been added!"
echo ------------------------------------------------------------------------------------------------------

exit 0
