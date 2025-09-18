# Environment Setup Guide

This guide explains how to set up and manage different environments for the WASCHBÄR Admin Panel.

## 📋 Available Environments

- **Development** - Local development with mock data
- **Staging** - Testing environment with staging backend
- **Integration** - Integration testing environment
- **Production** - Live production environment

## 🔧 Environment Files

Each environment has its own configuration file:

```
.env.example      # Template file (copy and customize)
.env.development  # Development environment
.env.staging      # Staging environment  
.env.integration  # Integration testing
.env.production   # Production environment
.env.local        # Active environment (git-ignored)
```

## 🚀 Quick Start

### 1. Choose Your Environment

```bash
# Development (default)
cp .env.development .env.local
npm run dev

# Staging
cp .env.staging .env.local
npm run dev:staging

# Integration
cp .env.integration .env.local
npm run dev:integration
```

### 2. Using Deployment Script

```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

## 📦 Docker Deployment

### Single Environment

```bash
# Development
docker-compose --profile dev up

# Staging
docker-compose --profile staging up

# Production
docker-compose --profile production up
```

### With Database

```bash
# Development with PostgreSQL
docker-compose --profile dev --profile db up
```

## 🔄 Environment-Specific Scripts

```bash
# Development
npm run dev                 # Start dev server
npm run build:dev          # Build for development

# Staging
npm run dev:staging         # Start staging dev server
npm run build:staging       # Build for staging
npm run start:staging       # Start staging production

# Integration
npm run dev:integration     # Start integration dev server
npm run build:integration   # Build for integration
npm run start:integration   # Start integration production

# Production
npm run build:prod          # Build for production
npm run start:prod          # Start production server
```

## ⚙️ Environment Configuration

### Key Variables

| Variable | Description | Development | Staging | Production |
|----------|-------------|-------------|---------|------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | localhost:3001 | api-staging.waschbar.com | api.waschbar.com |
| `NEXT_PUBLIC_MOCK_DATA` | Use mock data | true | false | false |
| `NEXT_PUBLIC_ENABLE_DEBUG` | Debug mode | true | true | false |
| `NEXT_PUBLIC_LOG_LEVEL` | Logging level | debug | info | error |

### Feature Flags

Control features per environment:

```env
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_MAINTENANCE_MODE=false
NEXT_PUBLIC_SHOW_DEV_TOOLS=true
```

## 🔒 Security Notes

### Development
- Uses test credentials
- Debug mode enabled
- Mock data active

### Staging
- Uses staging API keys
- Similar to production but safe for testing
- Analytics enabled for testing

### Production
- **⚠️ CHANGE ALL SECRETS** before deploying
- Strict security settings
- Error-level logging only
- No debug tools

## 🌐 API Integration

The project includes ready-to-use API layer:

```typescript
// Use environment-aware API calls
import { getEnvironmentConfig } from '@/lib/config/environment';
import { loginAdmin } from '@/lib/api/auth';

const config = getEnvironmentConfig();
if (config.mockData) {
  // Use mock data
} else {
  // Use real API
}
```

## 📊 Monitoring

### Development
- Console logging
- Dev tools available
- No external monitoring

### Staging/Integration
- Sentry error tracking
- Performance monitoring
- Test analytics

### Production
- Full monitoring stack
- Error alerting
- Performance metrics
- User analytics

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main, staging, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to staging
        if: github.ref == 'refs/heads/staging'
        run: ./scripts/deploy.sh staging
      - name: Deploy to production
        if: github.ref == 'refs/heads/main'
        run: ./scripts/deploy.sh production
```

## 🎯 Best Practices

1. **Never commit `.env.local`** - It's git-ignored for security
2. **Always use environment-specific builds** - Don't deploy dev builds to production
3. **Test in staging first** - Never deploy directly to production
4. **Update secrets regularly** - Especially for production
5. **Monitor all environments** - Set up proper alerting

## 🆘 Troubleshooting

### Environment not loading
```bash
# Check current environment
npm run type-check
cat .env.local
```

### Build failures
```bash
# Clean build
npm run clean
npm ci
npm run build
```

### API connection issues
```bash
# Check environment config
node -e "console.log(require('./src/lib/config/environment.ts').default)"
```

## 🔗 Related Files

- [`src/lib/config/environment.ts`](src/lib/config/environment.ts) - Environment configuration
- [`scripts/deploy.sh`](scripts/deploy.sh) - Deployment script
- [`docker-compose.yml`](docker-compose.yml) - Docker configuration
- [`Dockerfile`](Dockerfile) - Container build instructions
