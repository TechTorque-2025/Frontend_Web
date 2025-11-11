# Git Hooks

This project uses git hooks to maintain code quality and ensure builds pass before commits and pushes.

## Hooks Installed

- **pre-commit**: Runs `npm run lint` before each commit
  - Prevents commits if ESLint errors are found
  - Ensures code follows the project's linting standards

- **pre-push**: Runs `npm run build` before each push
  - Prevents pushes if the build fails
  - Ensures the project compiles successfully before sharing changes

## Setup

Run the setup script to configure git hooks:

```bash
./setup-hooks.sh
```

Or manually configure:

```bash
chmod +x .githooks/pre-commit .githooks/pre-push
git config core.hooksPath .githooks
```

## Bypassing Hooks

Sometimes you may need to bypass hooks (use sparingly):

```bash
# Skip pre-commit hook
git commit --no-verify -m "your message"

# Skip pre-push hook  
git push --no-verify
```

## Hook Details

### Pre-commit Hook
- Runs automatically on `git commit`
- Executes `npm run lint`
- Exits with error code if linting fails
- Shows helpful error messages

### Pre-push Hook
- Runs automatically on `git push`
- Executes `npm run build`
- Exits with error code if build fails
- Prevents pushing broken code to remote repository

## Benefits

✅ **Code Quality**: Ensures all committed code passes linting standards
✅ **Build Safety**: Prevents pushing code that doesn't compile
✅ **Team Consistency**: All developers follow the same quality checks
✅ **CI/CD Friendly**: Reduces failed builds in CI/CD pipelines