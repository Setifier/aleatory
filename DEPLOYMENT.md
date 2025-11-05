# Aleatory - Production Deployment Guide

This guide covers the complete deployment process for Aleatory on Vercel with domain management via Infomaniak.

## Prerequisites

- [x] Vercel account with project created
- [x] Infomaniak account for domain management (aleatory.fr)
- [x] Supabase project configured
- [x] Sentry project configured

## 1. Environment Variables Configuration

### Required Variables

Set these environment variables in your Vercel project settings:

| Variable | Description | Example | Where to find |
|----------|-------------|---------|---------------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` | Supabase Dashboard → Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | `eyJhbGc...` | Supabase Dashboard → Settings → API → Project API keys → anon public |
| `VITE_SENTRY_DSN` | Sentry Data Source Name | `https://xxxxx@sentry.io/xxxxx` | Sentry → Project Settings → Client Keys (DSN) |
| `VITE_APP_VERSION` | Application version | `1.0.0` | Match package.json version |

### How to set on Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable for:
   - **Production** environment
   - **Preview** environment (optional, can use same values)
   - **Development** environment (optional, use different Supabase project for testing)

## 2. Build Configuration

Vercel will automatically detect the build settings, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`
- **Node Version**: 18.x or higher

## 3. Supabase Configuration

### Authentication Settings

In Supabase Dashboard → Authentication → URL Configuration, add:

**Site URL**: `https://aleatory.fr`

**Redirect URLs** (add all):
- `https://aleatory.fr`
- `https://aleatory.fr/reset-password`
- `https://www.aleatory.fr` (if using www subdomain)
- Your Vercel preview URLs for testing: `https://*.vercel.app`

### Email Templates

Update email templates to use production domain:
- Reset Password: `https://aleatory.fr/reset-password`
- Email Confirmation: `https://aleatory.fr`

### Database Security

Ensure Row Level Security (RLS) policies are enabled on all tables:
- `saved_items`
- `folders`
- `lottery_history`

## 4. Domain Configuration (Infomaniak)

### DNS Settings

Configure these DNS records in Infomaniak:

```
Type    Name    Value                               TTL
A       @       76.76.21.21                        Auto
CNAME   www     cname.vercel-dns.com.              Auto
```

> Note: Replace the A record IP with Vercel's provided IP address from your Vercel domain settings.

### In Vercel

1. Go to your project → **Settings** → **Domains**
2. Add your domain: `aleatory.fr`
3. Add www subdomain: `www.aleatory.fr` (optional)
4. Follow Vercel's DNS verification instructions

## 5. Sentry Configuration

### Release Tracking

Sentry automatically tracks releases using the version from `VITE_APP_VERSION`. Update this with each deployment.

### Source Maps (Optional)

For better error tracking, upload source maps:

1. Install Sentry CLI: `npm install -D @sentry/cli`
2. Add to package.json scripts:
```json
"build:production": "npm run build && sentry-cli sourcemaps upload --org your-org --project aleatory ./dist"
```

### Environment Detection

- Development: Sentry is **disabled** (automatic)
- Production: Sentry is **enabled** with:
  - Session replay (10% sample rate)
  - Error replay (100%)
  - Performance monitoring (100% sample rate)

## 6. Pre-Deployment Checklist

Before deploying to production:

- [ ] All environment variables are set in Vercel
- [ ] Supabase redirect URLs are configured
- [ ] Domain DNS is configured in Infomaniak
- [ ] Legal pages are complete and accurate
- [ ] Test authentication flow (signup, signin, password reset)
- [ ] Test MFA functionality
- [ ] Verify lottery and tournament modes work
- [ ] Test saved items and folders
- [ ] Check responsive design on mobile/tablet
- [ ] Run `npm run build` locally to verify no errors
- [ ] Update `VITE_APP_VERSION` in .env for the release

## 7. Deployment Process

### Initial Deployment

1. **Connect GitHub repository to Vercel**:
   - Go to Vercel dashboard → **Add New** → **Project**
   - Import your Git repository
   - Configure environment variables
   - Deploy

2. **Configure domain**:
   - Add domain in Vercel settings
   - Update DNS in Infomaniak
   - Wait for DNS propagation (can take up to 48h, usually < 1h)

3. **Verify deployment**:
   - Visit https://aleatory.fr
   - Test authentication
   - Check Sentry for any errors
   - Verify all pages load correctly

### Subsequent Deployments

Vercel automatically deploys when you push to your main branch:

1. Update `VITE_APP_VERSION` in `.env` and `package.json`
2. Commit and push changes
3. Vercel will automatically build and deploy
4. Preview deployments are created for pull requests

## 8. Monitoring

### Vercel Analytics

- Check build logs in Vercel dashboard
- Monitor deployment status
- Review performance metrics

### Sentry

- Monitor error reports: https://sentry.io
- Check performance issues
- Review session replays for user issues

### Supabase

- Monitor database usage
- Check authentication logs
- Review API usage

## 9. Troubleshooting

### Build Failures

- Check Vercel build logs
- Verify all dependencies are in package.json
- Ensure TypeScript compiles without errors locally

### Environment Variables Not Working

- Verify variables are prefixed with `VITE_`
- Redeploy after adding/changing variables
- Check variable values don't have trailing spaces

### 404 Errors on Page Refresh

- Verify `vercel.json` is present with rewrites configuration
- Check that output directory is set to `dist`

### Authentication Issues

- Verify Supabase redirect URLs include your domain
- Check CORS settings in Supabase
- Ensure Site URL is set correctly

### Domain Not Resolving

- Verify DNS propagation: https://dnschecker.org
- Check DNS records in Infomaniak match Vercel requirements
- Wait up to 48 hours for full propagation

## 10. Security Considerations

### Security Headers

The `vercel.json` configuration includes security headers:
- X-Content-Type-Options: Prevents MIME sniffing
- X-Frame-Options: Prevents clickjacking
- X-XSS-Protection: Enables XSS filtering
- Referrer-Policy: Controls referrer information

### Environment Variables

- Never commit `.env` files to Git (already in .gitignore)
- Rotate Supabase keys if exposed
- Use different Supabase projects for dev/prod
- Keep Sentry DSN separate per environment

### Database

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Anonymous access is disabled

## 11. Backup and Recovery

### Database Backups

Supabase provides automatic daily backups. Manual backups:
1. Go to Supabase Dashboard → Database → Backups
2. Download backup or restore from point-in-time

### Code Repository

- Keep main branch protected
- Require pull request reviews
- Tag releases for version tracking

## Version History

- v1.0.0 (Novembre 2025) - Initial production release
