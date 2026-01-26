<!--
SPDX-FileCopyrightText: 2025 2025 INDUSTRIA DE DISEÑO TEXTIL S.A. (INDITEX S.A.)

SPDX-License-Identifier: Apache-2.0
-->

# Contributing

Thank you for your interest in contributing to this project! We value and appreciate any contributions you can make.

To maintain a collaborative and respectful environment, please consider the following guidelines when contributing to this project.

## Prerequisites

- Before starting to contribute to the code, you must first sign the Contributor License Agreement (CLA).
  Detailed instructions on how to proceed can be found [here](https://github.com/InditexTech/foss/blob/main/CONTRIBUTING.md).

## How to Contribute

1. Open an issue to discuss and gather feedback on the feature or fix you wish to address.
2. Fork the repository and clone it to your local machine.
3. Create a new branch to work on your contribution: `git checkout -b your-branch-name`.
4. Make the necessary changes in your local branch.
5. Ensure that your code follows the established project style and formatting guidelines.
6. Perform testing to ensure your changes do not introduce errors.
7. Make clear and descriptive commits that explain your changes.
8. Push your branch to the remote repository: `git push origin your-branch-name`.
9. Open a pull request describing your changes and linking the corresponding issue.
10. Await comments and discussions on your pull request. Make any necessary modifications based on the received feedback.
11. Once your pull request is approved, your contribution will be merged into the main branch.

## Contribution Guidelines

- All contributors are expected to follow the project's [code of conduct](CODE_OF_CONDUCT.md). Please be respectful and considerate towards other contributors.
- Before starting work on a new feature or fix, check existing [issues](../../issues) and [pull requests](../../pulls) to avoid duplications and unnecessary discussions.
- If you wish to work on an existing issue, comment on the issue to inform other contributors that you are working on it. This will help coordinate efforts and prevent conflicts.
- It is always advisable to discuss and gather feedback from the community before making significant changes to the project's structure or architecture.
- Ensure a clean and organized commit history. Divide your changes into logical and descriptive commits.
- Document any new changes or features you add. This will help other contributors and project users understand your work and its purpose.
- Be sure to link the corresponding issue in your pull request to maintain proper tracking of contributions.

## Development

This project uses [Next.js](https://nextjs.org/) and [NPM](https://docs.npmjs.com/about-npm). All code is located on the `/code` folder.

### Installation

Before start we need to install all the dependencies of the showcase frontend, this is done by executing the following command from the `/code` folder.

```
npm install
```

### Development Tasks

You can perform several operations on top of the different packages:

- `build`: builds the project.
- `dev`: launches the local development server.
- `lint`: lints the project.
- `format`: formats the project using prettier.

All this operations can be performed by executing the following command .

```
npm run <operation>
```

All commands are launched from the `/code` folder.

### Development Flow

1. Install the project dependencies.
2. Run the project local development server.
3. Make a change and validate on the frontend.

### Before Submitting

- Lint your code with `npm run lint`.
- Format your code with `npm run format`.

## Helpful Resources

- [Project documentation](README.md): Refer to our documentation for more information on the project structure and how to contribute.
- [Issues](../../issues): Check open issues and look for opportunities to contribute. Make sure to open an issue before starting work on a new feature or fix.

Thank you for your time and contribution! Your work helps to grow and improve this project. If you have any questions, feel free to reach out to us.
