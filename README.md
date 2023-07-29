# Wallace

Brings you freedom.

## Status

Currently in initial development. Do not use.

## Overview

Wallace is a fully open front end framework.

### Demos

```
npm run serve -w demos/click-counter
```

### Monorepo guideline

We use [lerna](https://lerna.js.org/) to version and publish:

```
lerna publish --no-private
```

We use npm workspaces to manage dependencies:

```
npm init -w ./packages/a
npm install tap --workspace package-b --save-dev
npm run test --workspace=a
```

https://ruanmartinelli.com/posts/npm-7-workspaces-1/

### Where to install third party packages

* If it is required for testing, it goes in the root **package.json**.
* If it is required for the distribution of a package, it goes into its own **package.json** <u>dependencies</u> (devDependencies do not see to be installed).