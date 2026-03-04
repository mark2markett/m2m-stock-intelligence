# Deployment Guide

## Step-by-Step Deployment Instructions

### Option 1: Netlify (Recommended - Free)

1. **Build the project locally**
   ```bash
   npm run build
   ```

2. **Create Netlify account** at [netlify.com](https://netlify.com)

3. **Deploy via drag & drop**
   - Go to Netlify dashboard
   - Drag the `dist` folder to the deployment area
   - Your site will be live instantly

4. **Set environment variables**
   - Go to Site Settings → Environment Variables
   - Add `VITE_POLYGON_API_KEY` with your Polygon.io key
   - Add `VITE_OPENAI_API_KEY` with your OpenAI key
   - Redeploy the site

### Option 2: Vercel (Free)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Set environment variables**
   - Go to Vercel dashboard
   - Select your project → Settings → Environment Variables
   - Add both API keys
   - Redeploy

### Option 3: Traditional Web Hosting

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Upload dist folder contents** to your web server via FTP/SSH

3. **Configure environment variables** (method varies by hosting provider)

### Option 4: GitHub Pages (Static hosting)

⚠️ **Note**: GitHub Pages doesn't support server-side environment variables, so you'll need to build with your API keys included (less secure).

1. **Add API keys directly to build**
2. **Build project**
   ```bash
   npm run build
   ```
3. **Push to gh-pages branch**

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Search functionality works
- [ ] Analysis generates successfully
- [ ] PDF download works
- [ ] No console errors
- [ ] Mobile responsive
- [ ] API keys are secure and not exposed in client-side code

## Troubleshooting

**"API key not configured" error**
- Ensure environment variables are set correctly
- Redeploy after adding variables
- Check variable names match exactly

**Analysis fails**
- Check browser console for specific errors
- Verify both API keys are valid
- Ensure OpenAI account has available credits

**Slow performance**
- Normal for first analysis (15-20 seconds)
- Subsequent analyses use caching (5-10 seconds)