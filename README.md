# proformajs-vue3
[![pipeline status](https://gitlab.com/openclinical/proformajs-vue3/badges/main/pipeline.svg)](https://gitlab.com/openclinical/proformajs-vue3/-/commits/main)

A vue3 version of proformajs-vue.

This repo uses [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
to create two npm libraries:
* proformajs-vue3 - components for creating protocols and running enactments
* proformajs-vue3-perform - a subset of the components needed to run enactments

This repo uses CI to:
* check the code format with prettier
* check the code with a linter
* check for dependency vulnerabilities
* run behavioural tests automatically

## Development

``npm run build && npm run dev`` will run the development demo.  You'll need to run ``npx vite build --watch`` in the relevant package to see your changes reflected in the demo as you make them.

### Testing

Cypress e2e tests can be run in development with ``npm run test:e2e:dev`` (tested with chrome).

### Committing changes

Before creating a merge request or pushing your changes to ``main`` please ensure that your code is linted and formatted and that the tests all run green.  Also ensure that a fresh install has no security vulnerabilities.

## Releases

``node versionHelper.cjs`` will check that all packages have the same version number and ``node versionHelper.cjs version`` will set the same version number for all packages.

Once you are ready to publish to npm and you are signed in to npm with permissions to publish you need to:
1. build again, ``npm run build`` (to avoid publishing a test build which wont work and will force to you to release another version - npm wont allow you to publish the same version twice)
2. run ``npm publish`` to publish [@openclinical/proformajs-vue3-perform](https://www.npmjs.com/package/@openclinical/proformajs-vue3)
3. run ``cd packages/perform && npm publish`` to publish [@openclinical/proformajs-vue3-perform](https://www.npmjs.com/package/@openclinical/proformajs-vue3-perform)

### Skeleton

The skeleton for this project was created with ``npm init vue@latest`` (3.4.27)
which generated the rest of this README.

Workspaces were then created with ``npm init -w .packages/map`` etc.

## Licensing

This project is owned by Openclinical CIC and dual-licensed with GPLv3 and a commercial license (please email licensing@openclinical.net for more details).  Contributions to the project are very welcome, and will be recognised via the contrib file, but will need to have copyright assigned to the CIC.
# ddsa-rwbuild-package
