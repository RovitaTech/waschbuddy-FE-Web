# WASCHBUDDY Admin Panel - Next.js

Modern admin panel for WASCHBUDDY laundry management system built with Next.js, TypeScript, and Tailwind CSS.

## 🚀 Features

- **Multi-tenant Architecture** - Support for multiple cities and dormitories
- **User Management** - Complete user lifecycle management
- **Machine Management** - Real-time machine monitoring and control
- **Reservation System** - Advanced booking and scheduling
- **Analytics Dashboard** - Comprehensive reporting and insights
- **Responsive Design** - Works on all devices
- **TypeScript** - Full type safety
- **Modern UI** - Built with shadcn/ui components

## � Deployment

The application is configured for automatic deployment to GitHub Pages:

- **Automatic Deployment:** Every push to the `main` branch triggers a GitHub Actions workflow
- **Static Export:** Next.js generates a static site optimized for GitHub Pages
- **Base Path:** Configured for GitHub repository hosting with proper asset paths
- **Live URL:** [https://rovitatech.github.io/wasch_bar_FE_Web/](https://rovitatech.github.io/wasch_bar_FE_Web/)

### Manual Deployment

To manually deploy to GitHub Pages:

```bash
npm run build
npm run export
```

### Local Production Build

To test the production build locally:

```bash
npm run build
npm run start
```

## 📋 Demo Credentials

```
Email: admin@waschbar.com
Password: admin123
```

## 🌐 Live Demo

The application is automatically deployed to GitHub Pages on every push to main:
**[https://rovitatech.github.io/wasch_bar_FE_Web/](https://rovitatech.github.io/wasch_bar_FE_Web/)**

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
src/
├── app/                # Next.js app router
│   ├── admin/         # Admin route entry
│   └── page.tsx       # Redirects to /admin
├── components/        # Reusable and feature UI components
├── dummy-data/        # Dummy datasets organized by screen/domain
├── lib/               # API/config shared utilities
└── styles/            # Global styles
```

## 🔌 API Integration

The project includes a complete API layer structure in `src/lib/api/` and a dedicated dummy-data module in `src/dummy-data/`.

Temporary login data-source selector:
- `Dummy Data`
- `API Data`

This temporary selector is available on the login screen and can be removed later.

- `auth.ts` - Authentication endpoints
- `users.ts` - User management endpoints  
- `machines.ts` - Machine management endpoints
- `reservations.ts` - Reservation endpoints

When backend rollout is complete, keep API mode only and remove the selector.

## 🌐 Multi-tenant Support

The application supports multiple tenants through:
- Location-based data filtering
- Dynamic routing per tenant
- Isolated user management per location

## 📦 Build & Deploy

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

Environment variables are defined in `.env.development` and `.env.production`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=WASCHBUDDY Admin Panel
```

## 📝 Notes

- All original functionality from the Vite version is preserved
- Mock data system remains intact for development
- API layer is structured and ready for backend integration
- UI components are identical to the original design
- Full TypeScript support with proper type definitions

## 📚 Documentation

- `docs/ENVIRONMENT_SETUP.md`
- `docs/PROJECT_DOCUMENTATION.md`
- `docs/SETTINGS_API_DOCUMENTATION.md`
- `docs/SETTINGS_MULTI_TENANT_EXPLANATION.md`
- `docs/architecture.md`
- `agents.md`
