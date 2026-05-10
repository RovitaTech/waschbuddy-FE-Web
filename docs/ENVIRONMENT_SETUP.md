# Environment Setup Guide

This project supports only two runtime environments:

- development
- production

## Environment Files

- .env.development: development defaults
- .env.production: production defaults

## Quick Start

### Development

npm run dev

### Production Build (local verification)

npm run build:prod
npm run start:prod

## Deployment Script

Use the deploy helper with one of the allowed environments:

./scripts/deploy.sh development
./scripts/deploy.sh production

## Available Scripts

- npm run dev
- npm run build
- npm run build:dev
- npm run build:prod
- npm run start
- npm run start:prod
- npm run lint
- npm run type-check

## Key Variables

- NEXT_PUBLIC_ENVIRONMENT: development or production
- NEXT_PUBLIC_API_URL: backend URL
- NEXT_PUBLIC_MOCK_DATA: true or false
- NEXT_PUBLIC_ENABLE_DEBUG: true or false
- NEXT_PUBLIC_LOG_LEVEL: debug/info/warn/error

## Security Notes

- Keep production secrets only in secure secret managers.
- Replace placeholder values from .env.production before live deployment.

## Related Files

- src/lib/config/environment.ts
- scripts/deploy.sh
