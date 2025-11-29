# Contributing to Permissio.io Node.js SDK

Thank you for your interest in contributing to the Permissio.io Node.js SDK! This document provides guidelines and steps for contributing.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/permissio/permissio-node/issues)
2. If not, create a new issue with:
   - A clear, descriptive title
   - Steps to reproduce the bug
   - Expected vs actual behavior
   - Node.js version and SDK version
   - Any relevant code snippets or error messages

### Suggesting Features

1. Check existing issues for similar suggestions
2. Create a new issue with the `enhancement` label
3. Describe the feature and its use case

### Pull Requests

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes
4. Write or update tests as needed
5. Ensure all tests pass: `npm test`
6. Run linting: `npm run lint`
7. Build the project: `npm run build`
8. Commit with clear messages following [Conventional Commits](https://www.conventionalcommits.org/)
9. Push to your fork and create a Pull Request

## Development Setup

### Prerequisites

- Node.js 16 or later
- npm or yarn

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/permisio-node.git
cd permisio-node

# Install dependencies
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test -- --coverage
```

### Building

```bash
# Build the project
npm run build

# Build in watch mode (for development)
npm run dev
```

### Code Style

- Follow TypeScript best practices
- Use meaningful variable and function names
- Document public APIs with JSDoc comments
- Keep functions focused and small
- Write meaningful test cases

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `test:` - Test changes
- `refactor:` - Code refactoring
- `chore:` - Maintenance tasks

Example: `feat: add tenant filtering to role assignment`

## Release Process

Releases are managed by the maintainers. Version bumps follow [Semantic Versioning](https://semver.org/).

## Questions?

Feel free to open an issue for any questions or reach out to the maintainers.

Thank you for contributing! 🎉
