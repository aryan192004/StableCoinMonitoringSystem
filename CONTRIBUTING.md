# Contributing to Stablecoin Monitoring Platform

Thank you for your interest in contributing! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Python 3.10+
- Docker (for local development)
- Git

### Local Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/stablecoin.git
   cd stablecoin
   ```
3. Run setup script:
   ```bash
   ./scripts/setup.sh  # Linux/Mac
   .\scripts\setup.ps1  # Windows
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Workflow

### Branch Naming

- Features: `feature/description`
- Bug fixes: `fix/description`
- Documentation: `docs/description`
- Refactoring: `refactor/description`

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(frontend): add real-time price chart

fix(backend): resolve WebSocket connection issue

docs(api): update endpoint documentation
```

### Code Style

#### TypeScript/JavaScript

- Use ESLint configuration
- Run `pnpm run lint` before committing
- Use Prettier for formatting

#### Python

- Follow PEP 8
- Use Black for formatting
- Type hints are required

### Testing

#### Frontend Tests

```bash
pnpm --filter @stablecoin/frontend test
```

#### Backend Tests

```bash
pnpm --filter @stablecoin/backend test
```

#### Python Tests

```bash
cd apps/backend/services
pytest
```

### Pull Request Process

1. **Update Documentation**
   - Update README if needed
   - Add inline code comments for complex logic
   - Update API docs if endpoints changed

2. **Test Your Changes**
   - All tests must pass
   - Add new tests for new features
   - Ensure code coverage doesn't decrease

3. **Run Linters**
   ```bash
   pnpm run lint
   ```

4. **Create Pull Request**
   - Use a clear, descriptive title
   - Reference related issues
   - Describe what changed and why
   - Include screenshots for UI changes

5. **PR Template**
   ```markdown
   ## Description
   Brief description of changes
   
   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update
   
   ## Testing
   How has this been tested?
   
   ## Checklist
   - [ ] Tests pass
   - [ ] Linter passes
   - [ ] Documentation updated
   - [ ] CHANGELOG updated (if applicable)
   ```

6. **Review Process**
   - At least one approval required
   - Address review comments
   - Keep PR scope focused

## Project Structure

```
stablecoin/
├── apps/           # Applications
│   ├── frontend/   # Next.js frontend
│   └── backend/    # Node.js + FastAPI backend
├── packages/       # Shared packages
│   ├── ui/         # UI components
│   ├── utils/      # Utilities
│   ├── types/      # TypeScript types
│   └── config/     # Configuration
├── infra/          # Infrastructure
│   ├── database/   # DB migrations
│   ├── docker/     # Dockerfiles
│   └── terraform/  # IaC
├── docs/           # Documentation
└── scripts/        # Build/deploy scripts
```

## What to Contribute

### Good First Issues

Look for issues labeled `good first issue` for beginner-friendly tasks.

### Priority Areas

1. **Features from PRD**
   - Peg deviation tracking
   - Liquidity monitoring
   - Reserve transparency
   - Alert system

2. **Testing**
   - Unit tests
   - Integration tests
   - E2E tests

3. **Documentation**
   - API documentation
   - User guides
   - Architecture docs

4. **Performance**
   - Query optimization
   - Caching improvements
   - Chart rendering

5. **UI/UX**
   - Responsive design
   - Accessibility
   - Dark mode

## Reporting Bugs

1. Check if bug already reported
2. Use bug report template
3. Include:
   - Detailed description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable
   - Environment info

## Proposing Features

1. Check if feature already requested
2. Use feature request template
3. Explain:
   - Problem it solves
   - Proposed solution
   - Alternatives considered
   - Implementation ideas

## Questions?

- Open a discussion on GitHub
- Check existing documentation
- Ask in PR comments

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing! 🎉
