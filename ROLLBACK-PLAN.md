# 🔄 Rollback Plan for Railway Deployment

## 🚨 **When to Rollback**
- Build failures on Railway
- Runtime errors after deployment
- Critical functionality broken
- Performance issues
- Security vulnerabilities discovered

## 📋 **Rollback Options**

### Option 1: Complete Rollback (Recommended)
Rollback all changes to the previous working state:

```bash
# View recent commits
git log --oneline -10

# Rollback to the last working commit
git revert HEAD --no-edit

# Push the rollback
git push origin main
```

### Option 2: Selective File Rollback
Rollback specific files to their previous state:

```bash
# Rollback specific files
git checkout HEAD~1 -- package.json
git checkout HEAD~1 -- frontend/package.json
git checkout HEAD~1 -- backend/package.json
git checkout HEAD~1 -- frontend/vite.config.ts

# Commit the rollback
git add .
git commit -m "rollback: revert Railway deployment changes for specific files"
git push origin main
```

### Option 3: Reset to Previous Commit
**⚠️ WARNING: This will lose all uncommitted changes**

```bash
# Hard reset to previous commit
git reset --hard HEAD~1

# Force push (use with caution)
git push --force-with-lease origin main
```

## 🔍 **Pre-Rollback Checklist**

Before rolling back, ensure you have:

- [ ] Identified the specific issue
- [ ] Documented the problem
- [ ] Backed up any important changes
- [ ] Notified team members
- [ ] Verified rollback target commit

## 📝 **Rollback Commands by File**

### Root package.json
```bash
git checkout HEAD~1 -- package.json
```

### Frontend package.json
```bash
git checkout HEAD~1 -- frontend/package.json
```

### Backend package.json
```bash
git checkout HEAD~1 -- backend/package.json
```

### Vite config
```bash
git checkout HEAD~1 -- frontend/vite.config.ts
```

### Dockerfile
```bash
git checkout HEAD~1 -- Dockerfile
git checkout HEAD~1 -- backend/Dockerfile
```

### Nixpacks config
```bash
git checkout HEAD~1 -- nixpacks.toml
```

### Environment files
```bash
git checkout HEAD~1 -- frontend/env.example
git checkout HEAD~1 -- backend/env.example
```

## 🚀 **Post-Rollback Actions**

### 1. **Verify Rollback Success**
```bash
# Check current status
git status

# Verify files are reverted
git diff HEAD~1
```

### 2. **Test Local Build**
```bash
# Test backend build
yarn build:backend

# Test frontend build
yarn build:frontend

# Test backend start
yarn start:backend
```

### 3. **Update Railway**
- Go to Railway dashboard
- Redeploy the rolled-back version
- Verify services are working

### 4. **Document the Issue**
- Record what went wrong
- Note the rollback commit hash
- Plan fixes for next deployment attempt

## 🔧 **Alternative Recovery Options**

### 1. **Hotfix Deployment**
Instead of rolling back, deploy a hotfix:

```bash
# Create hotfix branch
git checkout -b hotfix/railway-fix

# Make minimal fixes
# ... fix the issue ...

# Commit and push
git add .
git commit -m "hotfix: resolve Railway deployment issue"
git push origin hotfix/railway-fix

# Merge to main
git checkout main
git merge hotfix/railway-fix
git push origin main
```

### 2. **Partial Rollback**
Rollback only the problematic changes:

```bash
# Revert specific commits
git revert <commit-hash-1> <commit-hash-2>

# Push partial rollback
git push origin main
```

## 📚 **Useful Git Commands**

### View History
```bash
# View recent commits
git log --oneline -10

# View changes in a commit
git show <commit-hash>

# View file history
git log --follow -- <filename>
```

### Compare Versions
```bash
# Compare with previous commit
git diff HEAD~1

# Compare specific commits
git diff <commit-hash-1> <commit-hash-2>

# Compare specific file
git diff HEAD~1 -- <filename>
```

### Stash Changes
```bash
# Stash current changes
git stash

# Apply stashed changes
git stash pop

# List stashes
git stash list
```

## 🎯 **Rollback Decision Matrix**

| Issue Type | Recommended Action | Rollback Level |
|------------|-------------------|----------------|
| Build failure | Complete rollback | Full |
| Runtime error | Selective rollback | Partial |
| Performance issue | Hotfix | None |
| Security issue | Complete rollback | Full |
| Feature regression | Selective rollback | Partial |

## ⚠️ **Important Notes**

1. **Always test locally** before rolling back
2. **Communicate with team** about rollback
3. **Document the issue** for future reference
4. **Plan the fix** before next deployment
5. **Use force push sparingly** and only when necessary

## 🚀 **After Successful Rollback**

1. **Analyze the root cause** of the failure
2. **Fix the issue** in a new branch
3. **Test thoroughly** before redeploying
4. **Deploy incrementally** to catch issues early
5. **Monitor closely** after redeployment

---

**Remember: A successful rollback is better than a broken deployment!** 🔄
