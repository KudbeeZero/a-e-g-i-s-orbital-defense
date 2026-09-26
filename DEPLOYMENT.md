# Deployment Guide

This guide covers deploying AEGIS Orbital Defense to production platforms.

## ⭐ Quick Start (Recommended: Cloudflare Pages)

### 1. Create Cloudflare Account
Visit [dash.cloudflare.com](https://dash.cloudflare.com) and sign up (free tier available).

### 2. Connect Repository
1. Go to **Pages** → **Create a project**
2. Select **Connect to Git**
3. Choose GitHub and authorize
4. Select your repository: `kudbeezero/a-e-g-i-s-orbital-defense`
5. Click **Begin setup**

### 3. Configure Build
Set the following build parameters:

| Setting | Value |
|---------|-------|
| **Framework preset** | None (or Vite) |
| **Build command** | `cd src/frontend && pnpm install && pnpm build` |
| **Build output directory** | `src/frontend/dist` |

### 4. Deploy
1. Click **Save and Deploy**
2. Wait for the deployment to complete (~2-3 minutes)
3. Your game is now live! 🚀

**Live URL:** `https://<your-project>.pages.dev`

---

## 🌐 Alternative Platforms

### Vercel

**Easiest for React apps. Excellent DX.**

```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy (from project root)
vercel

# 3. Follow prompts
# - Link to GitHub account
# - Set root directory: src/frontend
# - Deploy!
```

**Live URL:** `https://<project>.vercel.app`

**Cost:** Free tier generous; paid starts at $20/month

### GitHub Pages

**Already configured. Zero cost.**

1. Ensure `.github/workflows/deploy-pages.yml` is in place (it is)
2. Push changes to `main` branch
3. GitHub automatically deploys in ~5 minutes

**Live URL:** `https://kudbeezero.github.io/a-e-g-i-s-orbital-defense/`

### AWS (S3 + CloudFront)

**For maximum control. Steeper learning curve.**

```bash
# 1. Create S3 bucket
aws s3 mb s3://aegis-orbital-defense

# 2. Build game
pnpm -C src/frontend build

# 3. Upload to S3
aws s3 sync src/frontend/dist s3://aegis-orbital-defense --delete

# 4. Create CloudFront distribution (manually or via CDK)
```

---

## 🔧 Environment Variables

### Cloudflare Pages Setup
1. Go to **Pages** → Your Project → **Settings** → **Environment variables**
2. Add variables (optional):
   ```
   DFX_NETWORK=ic
   STORAGE_GATEWAY_URL=https://blob.caffeine.ai
   ```

### Vercel Setup
1. Go to **Project Settings** → **Environment Variables**
2. Add the same variables as needed

### GitHub Pages
Uses defaults; no configuration needed.

---

## 🔐 Custom Domain

### For Cloudflare Pages
1. **Pages** → Your Project → **Custom domain**
2. Add your domain
3. Cloudflare provides nameserver instructions
4. Update your domain registrar

### For Vercel
1. **Project Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### For GitHub Pages
Update repository settings:
1. **Settings** → **Pages**
2. Enter custom domain
3. Update DNS to point to GitHub Pages

---

## 📊 Performance Tips

### Optimize Bundle
The game is already optimized with:
- Code splitting (Three.js, React separate)
- Minification with Terser
- Gzipped assets (~250KB)

### CDN Caching
All platforms provide global CDN caching:
- **Cloudflare Pages**: 300+ global locations
- **Vercel**: Global Edge Network
- **GitHub Pages**: GitHub's CDN

### Monitoring
- Cloudflare Analytics Dashboard
- Vercel Analytics
- GitHub Pages - GitHub Insights

---

## 🔍 Monitoring & Debugging

### Check Deployment Status
- **Cloudflare**: Pages dashboard shows deployment history
- **Vercel**: Deployments tab shows all releases
- **GitHub Pages**: Actions tab shows workflow runs

### View Logs
- **Cloudflare**: Logs available in Pages settings
- **Vercel**: Click deployment to see build logs
- **GitHub Pages**: Actions → Workflows → View logs

### Common Issues

**Build fails:**
1. Check build logs
2. Verify build command is correct
3. Ensure all dependencies install correctly

**Assets not loading:**
1. Check browser console for 404 errors
2. Verify `src/frontend/dist` has all files
3. Check `BASE_PATH` in vite config

**Performance issues:**
1. Check Network tab in DevTools
2. Measure Core Web Vitals
3. Profile with Lighthouse

---

## 🔄 Continuous Deployment

### Auto-Deploy on Main
All platforms auto-deploy when you push to `main`:

```bash
# Update code
git add .
git commit -m "feat: add new feature"
git push origin main

# Deployment starts automatically!
```

### Preview Deployments
- **Cloudflare Pages**: Auto-previews all branches
- **Vercel**: Auto-previews all PRs
- **GitHub Pages**: Only deploys from `main`

---

## 📈 Scaling

### If You Outgrow Free Tier

**Cloudflare Pages:**
- Free tier: 500 builds/month
- Paid: $20/month with 25,000 builds/month
- Auto-scaling, no limits

**Vercel:**
- Free tier: 100 deployments/month
- Pro: $20/month, unlimited
- Serverless functions support

**GitHub Pages:**
- Free forever
- Unlimited usage
- Good for projects without server-side needs

---

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Run `pnpm -C src/frontend typecheck` ✅
- [ ] Run `pnpm -C src/frontend check` ✅
- [ ] Run `pnpm -C src/frontend build` ✅
- [ ] Test built version locally: `cd dist && npx http-server`
- [ ] Verify game plays correctly
- [ ] Check console for errors (F12)
- [ ] Test on mobile (responsive design)
- [ ] Push to main branch
- [ ] Monitor deployment logs
- [ ] Test live game on production URL
- [ ] Share with team/users! 🎉

---

## 📞 Support

**Stuck?** Check these resources:

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Pages Help](https://docs.github.com/en/pages)

**Found a bug in deployment?** Open an issue with:
- Platform (Cloudflare/Vercel/GitHub)
- Build log output
- Error message from browser console
- Steps to reproduce

---

**Happy deploying! 🚀** Your game is ready for the world!
