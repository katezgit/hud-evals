Clean up local git branches safely, keeping only main and dev.

Steps:

1. Fetch latest from remote: `git fetch --prune`
2. Show current branch and uncommitted changes with `git status`
3. List all local branches with `git branch -vv`
4. Identify branches to delete (all except main and dev)
5. For each branch to delete, check if merged at remote:
   - `git branch -r --merged origin/main` — branches merged into remote main
   - `git branch -r --merged origin/dev` — branches merged into remote dev
   - Compare local branch tracking info to see if its remote was merged
6. Present summary:
   - Safe: local branches whose remote tracking branch was merged via PR
   - Risky: branches with no remote, or remote not merged (show last commit)
   - Protected: main, dev
7. Ask user to confirm before deleting
8. Delete confirmed branches with `git branch -d` (safe) or `git branch -D` (force, if user confirms risk)
