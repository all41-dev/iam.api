# template-api
The goal of this document is to describe how to create the nodejs project that will implement microservice API.

> Values shown between `[]` needs to be replaced by contextual value
## create an npm package folder
From your repositories containing folder:
 
    md [microservicename]-api
    cd [microservicename]-api
    npm init -y
    npm i --save-dev @types/express @types/es6-shim typescript
    npm install tslint typescript -g
    tslint -i
    npm i --save express
    
Edit the package.json file from package root folder to add this:

    "scripts": {
      "test": "echo \"Error: no test specified\" && exit 1",
      "tsc": "tsc" // <-- add this
    },


Run the following command to init tsconfig.json file:

    npm run tsc -- --init

copy index.ts and users-api.ts from this folder.