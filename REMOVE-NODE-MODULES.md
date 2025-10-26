# Removing node_modules from Git History

If `node_modules` was committed to the repository before `.gitignore` was created, follow these steps:

## Quick Solution

If `node_modules` is only in the current commit, remove it with:

```bash
git rm -r --cached node_modules
git commit -m "Remove node_modules from Git"
```

## Complete Cleanup

To remove `node_modules` from entire Git history:

```bash
# Remove node_modules from all commits
git filter-branch --force --index-filter \
  "git rm -rf --cached --ignore-unmatch node_modules" \
  --prune-empty --tag-name-filter cat -- --all

# Force push to remote
git push origin --force --all
```

Note: This rewrites history. Coordinate with your team before force pushing.

## Alternative: BFG Repo-Cleaner

For large repositories:

1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
2. Run: `bfg --delete-folders node_modules`
3. Clean up: `git reflog expire --expire=now --all && git gc --prune=now --aggressive`
4. Force push: `git push origin --force --all`

## Verify

Check that node_modules is removed:

```bash
git log --all --full-history -- node_modules
```

This should return no results if `node_modules` was successfully removed from history.

