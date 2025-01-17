# Contributing to Agent Platform

## Getting Started

### Prerequisites
- Python 3.8+
- FastAPI
- smolagents library
- Node.js (for frontend development)

### Development Setup
1. Clone the repository
2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Copy .env.example to .env and configure:
   ```bash
   cp .env.example .env
   ```

## Development Guidelines

### Code Style
- Follow PEP 8 for Python code
- Use type hints
- Document functions and classes
- Keep functions focused and small
- Write descriptive variable names

### Architecture
- Keep the core agent framework modular
- Separate concerns between layers
- Use dependency injection
- Follow REST API best practices
- Maintain backward compatibility

### Testing
- Write unit tests for new features
- Include integration tests
- Test edge cases
- Maintain test coverage
- Document test scenarios

### Documentation
- Update API documentation
- Include code examples
- Document configuration options
- Keep README up to date
- Add inline comments for complex logic

## Git Workflow

### Branches
- `main`: Production-ready code
- `develop`: Development branch
- Feature branches: `feature/feature-name`
- Bug fixes: `fix/bug-name`
- Releases: `release/version`

### Commits
- Use clear commit messages
- Reference issues/tickets
- Keep commits focused
- Follow conventional commits format

### Pull Requests
1. Create feature branch
2. Implement changes
3. Write/update tests
4. Update documentation
5. Submit PR against develop
6. Address review comments
7. Maintain clean commit history

## Tool Development

### Creating New Tools
1. Inherit from BaseTool
2. Implement required methods
3. Add type hints and docstrings
4. Include usage examples
5. Write comprehensive tests

### Tool Guidelines
- Keep tools focused
- Handle errors gracefully
- Include input validation
- Document dependencies
- Consider performance
- Follow security best practices

## UI Development

### Design Principles
- Follow brutalist design
- Maintain consistency
- Focus on usability
- Consider accessibility
- Support responsive design

### Frontend Guidelines
- Use semantic HTML
- Write maintainable CSS
- Follow JS best practices
- Optimize performance
- Handle errors gracefully

## Release Process

### Version Control
- Follow semantic versioning
- Update CHANGELOG.md
- Tag releases
- Document breaking changes

### Release Checklist
1. Update version numbers
2. Run test suite
3. Update documentation
4. Create release notes
5. Tag release
6. Deploy to staging
7. Verify deployment
8. Deploy to production

## Community

### Communication
- Use GitHub Issues
- Join Discord community
- Follow Code of Conduct
- Be respectful and inclusive
- Help other contributors

### Support
- Check existing issues
- Provide reproduction steps
- Share relevant logs
- Be responsive to questions
- Help with documentation

## Security

### Guidelines
- Report vulnerabilities privately
- Follow security best practices
- Review dependencies
- Keep dependencies updated
- Use secure configurations

### Reporting Issues
1. Check existing issues
2. Include reproduction steps
3. Provide environment details
4. Submit security issues privately
5. Wait for response

## License
By contributing, you agree that your contributions will be licensed under the project's license.
