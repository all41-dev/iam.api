# @all41-dev/iam.api
The project implements identity & access management API for the IAM microservice.

The project is a dependency of [@all41-dev/iam.ms](https://github.com/all41-dev/iam.ms), a self-contained IAM service based on OAUTH2.

The api can also be plugged in any project based on [@all41-dev/server](https://github.com/all41-dev/server) (with its UI complement, [@harps/iam.identity-ui](https://github.com/all41-dev/iam.ui)).

The following VARS must be set:
- IAM_SQL_DATABASE #Database name
- IAM_SQL_USERNAME
- IAM_SQL_PASSWORD
- SMTP_PASSWORD #SMTP is used to send change password tokens
