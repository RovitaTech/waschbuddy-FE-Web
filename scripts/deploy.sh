#!/bin/bash

# Deployment script for different environments
# Usage: ./scripts/deploy.sh [environment]
# Example: ./scripts/deploy.sh staging

set -e  # Exit on any error

ENVIRONMENT=${1:-development}
ALLOWED_ENVIRONMENTS=("development" "staging" "integration" "production")

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Validate environment
if [[ ! " ${ALLOWED_ENVIRONMENTS[@]} " =~ " ${ENVIRONMENT} " ]]; then
    print_error "Invalid environment: $ENVIRONMENT"
    print_error "Allowed environments: ${ALLOWED_ENVIRONMENTS[*]}"
    exit 1
fi

print_status "Starting deployment for environment: $ENVIRONMENT"

# Check if environment file exists
ENV_FILE=".env.${ENVIRONMENT}"
if [ ! -f "$ENV_FILE" ]; then
    print_error "Environment file not found: $ENV_FILE"
    exit 1
fi

# Copy environment file to .env.local
print_status "Setting up environment variables..."
cp "$ENV_FILE" .env.local
print_success "Environment variables configured for $ENVIRONMENT"

# Install dependencies
print_status "Installing dependencies..."
npm ci
print_success "Dependencies installed"

# Type checking
print_status "Running type check..."
npm run type-check
print_success "Type check passed"

# Linting
print_status "Running linter..."
npm run lint
print_success "Linting passed"

# Build the application
print_status "Building application for $ENVIRONMENT..."
case $ENVIRONMENT in
    "development")
        npm run build:dev
        ;;
    "staging")
        npm run build:staging
        ;;
    "integration")
        npm run build:integration
        ;;
    "production")
        npm run build:prod
        ;;
esac
print_success "Build completed successfully"

# Additional steps for production
if [ "$ENVIRONMENT" = "production" ]; then
    print_warning "Production deployment detected"
    print_warning "Make sure to:"
    print_warning "1. Update all secret keys in .env.production"
    print_warning "2. Configure proper CORS origins"
    print_warning "3. Set up monitoring and analytics"
    print_warning "4. Verify SSL certificates"
fi

print_success "Deployment for $ENVIRONMENT completed successfully!"
print_status "You can now start the application with: npm run start"

# Environment-specific instructions
case $ENVIRONMENT in
    "development")
        print_status "Development environment ready"
        print_status "Start with: npm run dev"
        ;;
    "staging")
        print_status "Staging environment ready"
        print_status "Start with: npm run start:staging"
        ;;
    "integration")
        print_status "Integration environment ready"
        print_status "Start with: npm run start:integration"
        ;;
    "production")
        print_status "Production environment ready"
        print_status "Start with: npm run start:prod"
        ;;
esac
