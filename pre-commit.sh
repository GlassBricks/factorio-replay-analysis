#!/usr/bin/env bash

# symlink this to .git/hooks/pre-commit to use

# Check if commit contains changes to anything in src
# If so, run npm run build before committing
if git diff --cached --name-only | grep -q "^src/"; then
  npm run build
  git add out
fi
