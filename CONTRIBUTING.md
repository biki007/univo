# Contributing to Univio

We love your input! We want to make contributing to Univio as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

## Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Development Setup

### Prerequisites

- Node.js 18+ and npm/yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/univio/platform.git
   cd platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Code Style

We use ESLint and Prettier to maintain code quality and consistency.

### Running Linting

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable linting errors
npm run lint:fix
```

### Code Formatting

```bash
# Format code with Prettier
npm run format
```

## Testing

We use Jest for testing. Please write tests for new features and bug fixes.

```bash
# Run tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation only changes
- `style:` Changes that do not affect the meaning of the code
- `refactor:` A code change that neither fixes a bug nor adds a feature
- `perf:` A code change that improves performance
- `test:` Adding missing tests or correcting existing tests
- `chore:` Changes to the build process or auxiliary tools

### Examples

```
feat: add real-time chat functionality
fix: resolve WebRTC connection issues
docs: update API documentation
style: format code with prettier
refactor: simplify authentication logic
perf: optimize video rendering performance
test: add unit tests for meeting service
chore: update dependencies
```

## Issue Reporting

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/univio/platform/issues/new).

### Bug Reports

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can
- What you expected would happen
- What actually happens
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

### Feature Requests

We welcome feature requests! Please provide:

- A clear and descriptive title
- A detailed description of the proposed feature
- Use cases and examples
- Any additional context or screenshots

## Project Structure

```
src/
├── app/                    # Next.js 14 App Router
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── meeting/          # Meeting-specific components
│   └── layout/           # Layout components
├── lib/                  # Utility libraries
├── hooks/                # Custom React hooks
├── contexts/             # React contexts
└── types/                # TypeScript definitions
```

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: WebRTC, Socket.io
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint, Prettier

## Areas for Contribution

### High Priority
- WebRTC optimization and bug fixes
- UI/UX improvements
- Performance optimizations
- Test coverage improvements
- Documentation updates

### Medium Priority
- New meeting features
- Advanced AI integrations
- Mobile responsiveness
- Accessibility improvements

### Future Features
- AR/VR meeting spaces
- Advanced analytics
- Third-party integrations
- Enterprise features

## Code Review Process

1. All submissions require review before merging
2. We may ask for changes before a PR can be merged
3. We'll do our best to provide feedback within 48 hours
4. Once approved, maintainers will merge the PR

## Community Guidelines

### Our Standards

- Be respectful and inclusive
- Provide constructive feedback
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or trolling
- Publishing private information without permission
- Other conduct which could reasonably be considered inappropriate

## Getting Help

- **Documentation**: Check our [docs](docs/) folder
- **Discussions**: Use [GitHub Discussions](https://github.com/univio/platform/discussions)
- **Discord**: Join our [Discord server](https://discord.gg/univio)
- **Email**: Contact us at contribute@univio.com

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- Special contributor badges

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

Don't hesitate to reach out! We're here to help and appreciate all contributions, no matter how small.

---

**Thank you for contributing to Univio!** 🚀