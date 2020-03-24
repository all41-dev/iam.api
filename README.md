# @harps/iam.identity-api
The project implements identity & access management API for the IAM microservice.

The project is a dependency of [@harps/iam.ms](https://bitbucket.org/all41/iam.ms), a self-contained IAM service based on OAUTH2.

The api can also be plugged in any project based on [@all41/server](https://bitbucket.org/all41/server) (with its UI complement, [@harps/iam.identity-ui](https://bitbucket.org/all41/iam.ui)).

The project requires a database to be setup. The DDL is avilable in https://bitbucket.org/all41/iam.api/src/master/src/models/db/ddl.sql.

Aditionally, the following VARS must be set:
- IAM_SQL_DATABASE #Database name
- IAM_SQL_USERNAME
- IAM_SQL_PASSWORD
- SMTP_PASSWORD #SMTP is used to send change password tokens
