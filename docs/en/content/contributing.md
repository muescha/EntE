# Contributing to EntE

👍🎉 First off, thanks for taking the time to contribute! 🎉👍

## How to Contribute

First, create an issue stating the problem and wait for an answer so you can be sure nobody else works on the same issue.
Then, fork the Repo and make your fixes.
After testing them (consider implementing Unit- or E2E-Tests, for Bug-Fixes a Regression Test would be great), create a merge request.
I will happily review and merge the request!

## What Should I Know Before I Get Started?

EntE consists of a row of packages, all managed by [Lerna](https://github.com/lerna/lerna).
After cloning the repository, use `lerna bootstrap` to install all dependencies and link the packages.

The packages are located in the folder `/packages` and are divided by domain.
A small overview:

| Package    | Purpose                               |
| ---------- | ------------------------------------- |
| ente-api   | REST-API, deals with Auth and RBAC    |
| ente-types | Shared typings and validation logic   |
| ente-ui    | React SPA that you see in the browser |

The most important packages are `ente-api` and `ente-ui`, most of the logic is in there.

To start a local dev environment, build all images with `make build-docker` and start them with `./scripts/dev/start.sh`.
When working on the UI, make sure to run `yarn watch` in `/packages/ente-ui` to start the bundler.