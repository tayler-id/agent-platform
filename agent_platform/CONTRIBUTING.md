# Contributing to Agent Platform

Thank you for your interest in contributing to Agent Platform! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork the repository
2. Clone your fork:
```bash
git clone https://github.com/your-username/agent-platform.git
cd agent-platform
```

3. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

4. Install development dependencies:
```bash
pip install -r requirements.txt
```

5. Set up pre-commit hooks:
```bash
pre-commit install
```

## Development Workflow

1. Create a new branch for your feature:
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes following our coding standards
3. Write/update tests
4. Run the test suite:
```bash
python -m pytest
```

5. Commit your changes:
```bash
git add .
git commit -m "feat: add your feature description"
```

6. Push to your fork:
```bash
git push origin feature/your-feature-name
```

7. Create a Pull Request

## Coding Standards

### Python Code Style

- Follow PEP 8 guidelines
- Use type hints
- Maximum line length: 88 characters (Black default)
- Use docstrings for functions and classes

Example:
```python
from typing import Optional, List

def process_data(input_data: List[str], max_items: Optional[int] = None) -> dict:
    """Process input data and return results.
    
    Args:
        input_data: List of strings to process
        max_items: Optional maximum number of items to process
        
    Returns:
        Dictionary containing processed results
        
    Raises:
        ValueError: If input_data is empty
    """
    if not input_data:
        raise ValueError("Input data cannot be empty")
    
    # Implementation
    return {"result": "processed"}
```

### SQL Style

- Use lowercase for keywords
- Use snake_case for names
- Include comments for complex queries
- Add appropriate indexes

Example:
```sql
-- Create table for storing agent configurations
create table public.agent_configs (
    id uuid default uuid_generate_v4() primary key,
    agent_id uuid references public.agents(id),
    config_key varchar(50) not null,
    config_value jsonb not null,
    created_at timestamptz default now()
);

-- Index for faster lookups
create index idx_agent_configs_agent_id on public.agent_configs(agent_id);
```

### Frontend Style

- Follow brutalist design principles
- Use semantic HTML
- Keep CSS minimal and functional
- Maintain responsive design

Example:
```html
<div class="agent-card">
    <h2 class="agent-name">Agent Name</h2>
    <div class="agent-stats">
        <span class="stat">Rating: 4.5</span>
        <span class="stat">Uses: 1,234</span>
    </div>
</div>
```

```css
.agent-card {
    border: 2px solid #000;
    padding: 1rem;
    margin: 1rem 0;
    background: #fff;
}

.agent-name {
    font-family: monospace;
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
}

.agent-stats {
    display: flex;
    gap: 1rem;
}
```

## Pull Request Process

1. Update documentation for any new features
2. Add or update tests as needed
3. Ensure all tests pass
4. Update the CHANGELOG.md file
5. Request review from maintainers

### PR Title Format

Use conventional commits format:
- `feat: add new feature`
- `fix: resolve bug issue`
- `docs: update documentation`
- `test: add tests`
- `refactor: improve code structure`

### PR Description Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe testing done

## Screenshots (if applicable)
Add screenshots

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
```

## Database Changes

When making database changes:

1. Add migrations to `scripts/setup_supabase.sql`
2. Update RLS policies as needed
3. Add appropriate indexes
4. Test migrations both ways (up/down)
5. Update documentation

## Testing Guidelines

- Write unit tests for new features
- Include integration tests for API endpoints
- Test real-time functionality
- Verify RLS policies
- Test error cases

Example test:
```python
import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_agent():
    async with AsyncClient() as client:
        response = await client.post(
            "/agents",
            json={
                "name": "Test Agent",
                "description": "Test description"
            }
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Agent"
```

## Getting Help

- Join our Discord server
- Check existing issues
- Ask in discussions
- Contact maintainers

## Code of Conduct

Please note that this project is released with a [Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.
