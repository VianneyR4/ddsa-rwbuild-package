# ddsa-vue3-views

A vue3 version of ddsa-vue3-views.

This repo uses [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces)
to create two npm libraries:
* ddsa-vue3-views - components for creating protocols and running enactments

This repo uses CI to:
* check the code format with prettier
* check the code with a linter
* check for dependency vulnerabilities
* run behavioural tests automatically

## Development

``npm run build && npm run dev`` will run the development demo.  You'll need to run ``npx vite build --watch`` in the relevant package to see your changes reflected in the demo as you make them.

### Testing

Cypress e2e tests can be run in development with ``npm run test:e2e:dev`` (tested with chrome).

### Skeleton

The skeleton for this project was created with ``npm init vue@latest`` (3.4.27)
which generated the rest of this README.

Workspaces were then created with ``npm init -w .packages/map`` etc.

## Licensing

"license": "ISC"

