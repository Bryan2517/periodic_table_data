# Deployment Guide

This guide will help you deploy your project so others can access it via a link.

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (if you don't have it):
   ```bash
   npm install -g vercel
   ```

2. **Deploy from your project folder**:
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Login/create account if needed
   - Confirm project settings
   - Your project will be deployed!

3. **Set Environment Variables**:
   - Go to your Vercel dashboard: https://vercel.com/dashboard
   - Select your project
   - Go to Settings → Environment Variables
   - Add:
     - `VITE_CLIENT_ID` = your Google OAuth Client ID
     - `VITE_SPREADSHEET_ID` = your Google Sheets ID
   - Redeploy (or it will auto-deploy)

4. **Share the link**: Vercel will give you a URL like `https://your-project.vercel.app`

### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build your project**:
   ```bash
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod
   ```

4. **Set Environment Variables**:
   - Go to Netlify dashboard → Site settings → Environment variables
   - Add `VITE_CLIENT_ID` and `VITE_SPREADSHEET_ID`

### Option 3: GitHub Pages (Free but requires GitHub)

1. **Push your code to GitHub** (make sure `.env` is in `.gitignore`)

2. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Update package.json** scripts:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

5. **Set Environment Variables**: GitHub Pages doesn't support server-side env vars, so you'll need to use a different approach (see note below)

### Option 4: Cloudflare Pages

1. Push code to GitHub/GitLab
2. Connect repository to Cloudflare Pages
3. Set build command: `npm run build`
4. Set output directory: `dist`
5. Add environment variables in Cloudflare dashboard

## Important Notes

⚠️ **Environment Variables**: Since `.env` files aren't committed to git, you MUST set environment variables in your hosting platform's dashboard. The variables need to be prefixed with `VITE_` for Vite projects.

⚠️ **Google OAuth**: Make sure to add your deployment URL to the authorized JavaScript origins in your Google Cloud Console:
- Go to Google Cloud Console → APIs & Services → Credentials
- Edit your OAuth 2.0 Client ID
- Add your deployment URL (e.g., `https://your-project.vercel.app`) to "Authorized JavaScript origins"

## Testing Locally Before Deploying

Test your production build locally:
```bash
npm run build
npm run preview
```

