# 🔄 Railway Deployment Rollback Plan

## 🚨 **Emergency Rollback Procedures**

This document outlines the steps to rollback your Railway deployment in case of critical issues.

## 📋 **Pre-Rollback Checklist**

Before rolling back, ensure you have:
- [ ] Identified the specific issue causing the rollback
- [ ] Documented the current deployment state
- [ ] Notified stakeholders about the rollback
- [ ] Prepared the rollback target (previous working version)

## 🔄 **Complete Rollback (Recommended for Critical Issues)**

### **Option 1: Git Revert (Safest)**
```bash
# 1. Check current commit hash
git log --oneline -5

# 2. Revert the problematic commit
git revert <commit-hash>

# 3. Push the revert
git push origin main

# 4. Railway will auto-deploy the reverted version
```

### **Option 2: Reset to Previous Working Version**
```bash
# 1. Check current commit hash
git log --oneline -5

# 2. Reset to previous working commit
git reset --hard <previous-commit-hash>

# 3. Force push (use with caution)
git push --force-with-lease origin main

# 4. Railway will auto-deploy the reset version
```

## 🎯 **Selective Rollback (For Specific Issues)**

### **Rollback Backend Only**
```bash
# 1. Revert backend-specific changes
git checkout HEAD~1 -- backend/package.json
git checkout HEAD~1 -- backend/Dockerfile
git checkout HEAD~1 -- backend/src/

# 2. Commit the selective rollback
git add backend/
git commit -m "rollback: revert backend changes to fix Railway deployment"

# 3. Push changes
git push origin main
```

### **Rollback Frontend Only**
```bash
# 1. Revert frontend-specific changes
git checkout HEAD~1 -- frontend/package.json
git checkout HEAD~1 -- frontend/Dockerfile
git checkout HEAD~1 -- frontend/vite.config.ts

# 2. Commit the selective rollback
git add frontend/
git commit -m "rollback: revert frontend changes to fix Railway deployment"

# 3. Push changes
git push origin main
```

### **Rollback Configuration Files Only**
```bash
# 1. Revert Railway configuration files
git checkout HEAD~1 -- nixpacks.toml
git checkout HEAD~1 -- Dockerfile
git checkout HEAD~1 -- railway.json
git checkout HEAD~1 -- RAILWAY-DEPLOYMENT-PLAYBOOK.md

# 2. Commit the configuration rollback
git add nixpacks.toml Dockerfile railway.json RAILWAY-DEPLOYMENT-PLAYBOOK.md
git commit -m "rollback: revert Railway configuration files"

# 3. Push changes
git push origin main
```

## 🚀 **Railway-Specific Rollback**

### **Rollback via Railway Dashboard**
1. Go to your Railway project dashboard
2. Select the problematic service
3. Click on "Deployments" tab
4. Find the last working deployment
5. Click "Redeploy" on that deployment

### **Rollback via Railway CLI**
```bash
# 1. List deployments
railway deployments

# 2. Rollback to specific deployment
railway rollback <deployment-id>

# 3. Verify rollback
railway status
```

## 🔧 **Post-Rollback Actions**

### **Immediate Actions**
1. **Verify Rollback Success**
   - Check if services are running
   - Verify health checks pass
   - Test basic functionality

2. **Monitor Logs**
   - Check Railway service logs
   - Monitor for any new errors
   - Verify environment variables

3. **Test Integration**
   - Test frontend-backend communication
   - Verify database connections
   - Check API endpoints

### **Documentation Updates**
1. **Update Rollback Log**
   - Document what was rolled back
   - Note the reason for rollback
   - Record the rollback timestamp

2. **Update Deployment Notes**
   - Mark the problematic deployment
   - Note any lessons learned
   - Update deployment procedures

## 🚨 **Critical Rollback Scenarios**

### **Database Connection Issues**
```bash
# If database connection is the issue, rollback backend only
git checkout HEAD~1 -- backend/src/config/database.ts
git checkout HEAD~1 -- backend/src/routes/health.ts

git add backend/
git commit -m "rollback: revert database configuration changes"
git push origin main
```

### **Build Failures**
```bash
# If build is failing, rollback package.json changes
git checkout HEAD~1 -- package.json
git checkout HEAD~1 -- backend/package.json
git checkout HEAD~1 -- frontend/package.json

git add package.json backend/package.json frontend/package.json
git commit -m "rollback: revert package.json changes causing build failures"
git push origin main
```

### **Health Check Failures**
```bash
# If health checks are failing, rollback Dockerfile changes
git checkout HEAD~1 -- backend/Dockerfile
git checkout HEAD~1 -- frontend/Dockerfile

git add backend/Dockerfile frontend/Dockerfile
git commit -m "rollback: revert Dockerfile changes causing health check failures"
git push origin main
```

## 📊 **Rollback Decision Matrix**

| Issue Type | Severity | Rollback Strategy | Rollback Target |
|------------|----------|-------------------|-----------------|
| Build Failure | High | Complete | Previous working commit |
| Health Check Failure | High | Selective (Dockerfiles) | Previous working commit |
| Runtime Errors | Medium | Selective (Source code) | Previous working commit |
| Configuration Issues | Low | Selective (Config files) | Previous working commit |
| Performance Degradation | Medium | Selective (Recent changes) | Previous working commit |

## 🔍 **Troubleshooting Rollback Issues**

### **Rollback Fails to Deploy**
```bash
# 1. Check Railway build logs
railway logs

# 2. Verify the rolled back code builds locally
yarn build:backend
yarn build:frontend

# 3. If local build fails, rollback further
git checkout HEAD~2 -- .
git commit -m "rollback: revert to earlier working version"
git push origin main
```

### **Rollback Causes New Issues**
```bash
# 1. Identify the new issue
railway logs

# 2. Rollback to an even earlier version
git log --oneline -10
git checkout <earlier-commit-hash> -- .

# 3. Commit and push
git add .
git commit -m "rollback: revert to earlier stable version"
git push origin main
```

## 📝 **Rollback Checklist**

- [ ] Issue identified and documented
- [ ] Rollback strategy selected
- [ ] Rollback target identified
- [ ] Rollback executed
- [ ] Services redeployed
- [ ] Health checks passing
- [ ] Basic functionality verified
- [ ] Integration tests passed
- [ ] Rollback documented
- [ ] Root cause analysis initiated

## 🎯 **Prevention Measures**

To avoid future rollbacks:
1. **Test Locally First**: Always test changes locally before pushing
2. **Use Feature Branches**: Develop new features in separate branches
3. **Incremental Deployments**: Deploy changes in small, manageable chunks
4. **Automated Testing**: Implement comprehensive test suites
5. **Monitoring**: Set up proper monitoring and alerting
6. **Documentation**: Keep deployment procedures up to date

---

**Remember**: Rollbacks are a normal part of the deployment process. The goal is to minimize downtime and restore service quickly while maintaining system stability.
