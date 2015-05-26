# Skivvy package: `eslint`
[![npm version](https://img.shields.io/npm/v/@skivvy/skivvy-package-eslint.svg)](https://www.npmjs.com/package/@skivvy/skivvy-package-eslint)
![Stability](https://img.shields.io/badge/stability-stable-brightgreen.svg)
[![Build Status](https://travis-ci.org/skivvyjs/skivvy-package-eslint.svg?branch=master)](https://travis-ci.org/skivvyjs/skivvy-package-eslint)

> Lint source files using ESLint


## Installation

```bash
skivvy install eslint
```


## Overview

This package allows you to lint JavaScript files using ESLint from within the [Skivvy](https://www.npmjs.com/package/skivvy) task runner.


## Configuration settings:

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| `user` | `string` | No | `"world"` | Username for example task |


## Included tasks

### `hello-world`

Example task

#### Usage:

```bash
skivvy run eslint
```


#### Configuration settings:

| Name | Type | Required | Default | Description |
| ---- | ---- | -------- | ------- | ----------- |
| `files` | `string` `Array<string>` | Yes | N/A | Files to lint |
| `options` | `object` | No | `{}` | [ESLint options](http://eslint.org/docs/developer-guide/nodejs-api) |
| `options.configFile` | `string` | No | `null` | The configuration file to use |
| `options.envs` | `Array<string>` | No | `null` | An array of environments to load |
| `options.extensions` | `Array<string>` | No | `[".js"]` | An array of filename extensions that should be checked for code |
| `options.globals` | `Array<string>` | No | `[]` | An array of global variables to declare |
| `options.ignore` | `boolean` | No | `true` | False disables use of `.eslintignore` |
| `options.ignorePath` | `string` | No | `null` | The ignore file to use instead of `.eslintignore` |
| `options.reset` | `boolean` | No | `false` | True disables all default rules and environments |
| `options.baseConfig` | `boolean` `object` | No | `null` | Set to `false` to disable use of base config. Could be set to an object to override default base config as well. |
| `options.rulePaths` | `Array<string>` | No | `[]` | An array of directories to load custom rules from |
| `options.rules` | `{}` | No | `null` | An object of rules to use |
| `options.useEslintrc` | `boolean` | No | `true` | Set to `false` to disable use of `.eslintrc files` |
