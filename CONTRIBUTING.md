# Contributing

Thank you for your interest in contributing to the Uniswap widgets! 🦄

# Development

Before developing locally, you'll need install the project's dependencies and create a `.env` file.

- `yarn install`

The `.env` file specifies third-party APIs for use in e2e testing and the cosmos viewer:
- `JSON_RPC_PROVIDER` must be specified for e2e tests to work.

```
JSON_RPC_PROVIDER='<JSON_RPC_PROVIDER>`
```

## Running widgets locally

1. `yarn start`
- This will open a cosmos viewer for feedback in realtime.

## Running tests locally

1. `yarn test`
- You may also run `yarn test --watch` for feedback in realtime.

Integration tests are run through a separate command, and require a hardhat node to be running:

1. `yarn hardhat &`
1. `yarn test:e2e`

## Creating a production build

_Releases are created through github workflows._

1. `yarn tsc`
1. `yarn build`
- You may also run `yarn build --watch` for feedback in realtime.

## Engineering standards

Code merged into the `main` branch of this repository should adhere to high standards of correctness and maintainability. 
Use your best judgment when applying these standards.
If code is in the critical path, will be frequently visited, or makes large architectural changes, consider following all the standards.

- Have at least one engineer approve of large code refactorings
- At least manually test small code changes, prefer automated tests
- Thoroughly unit test when code is not obviously correct
- If something breaks, add automated tests so it doesn't break again
- Add integration tests for new pages or flows
- Verify that all CI checks pass before merging
- Have at least one product manager or designer approve of any significant UX changes

Additionally, git commit messages should follow [Conventional Commits](https://conventionalcommits.org), which is used to standardize the release process.

## Guidelines

The following points should help guide your development:

- Security: the interface is safe to use
  - Avoid adding unnecessary dependencies due to [supply chain risk](https://github.com/LavaMoat/lavamoat#further-reading-on-software-supplychain-security)
- Reproducibility: anyone can build the interface
  - Avoid adding steps to the development/build processes
  - The build must be deterministic, i.e. a particular commit hash always produces the same build
- Decentralization: anyone can run the interface
  - An Ethereum node should be the only critical dependency 
  - All other external dependencies should only enhance the UX ([graceful degradation](https://developer.mozilla.org/en-US/docs/Glossary/Graceful_degradation))
- Accessibility: anyone can use the interface
  - The interface should be responsive, small and also run well on low performance devices (majority of swaps on mobile!)

## Publishing

Releases are manually triggered [through the release workflow](https://github.com/Uniswap/uniswap-interface/actions/workflows/release.yaml).

In general, fixes and features should be created on a new branch from `main`.
Use the automatic Vercel preview for the branch to collect feedback.  

Fix pull requests should be merged when both ready and tested. 

Features should not be merged until they are both ready for users and tested.
When the feature is ready for review, create a new pull request from the feature branch into `main` and request reviews from the appropriate UX reviewers (PMs or designers).

# Translations

Uniswap uses [Crowdin](https://crowdin.com/project/uniswap-interface) for managing translations. 
The [crowdin-upload workflow](./.github/workflows/crowdin-upload.yaml) uploads new strings for translation to the Crowdin project whenever code using the [lingui translation macros](https://lingui.js.org/ref/macro.html) is merged into `main`.

Every hour, translations are synced back down from Crowdin to the repository in the [crowdin-download workflow](./.github/workflows/crowdin-download.yaml).
We sync to the repository on a schedule, rather than download translations at build time, so that builds are always reproducible.

You can contribute by joining Crowdin to proofread existing translations [here](https://crowdin.com/project/uniswap-interface/invite?d=93i5n413q403t4g473p443o4c3t2g3s21343u2c3n403l4b3v2735353i4g4k4l4g453j4g4o4j4e4k4b323l4a3h463s4g453q443m4e3t2b303s2a35353l403o443v293e303k4g4n4r4g483i4g4r4j4e4o473i5n4a3t463t4o4)
Or, ask to join us as a translator in the Discord!
