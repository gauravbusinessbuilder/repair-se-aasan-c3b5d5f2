# Deploy to Netlify

Yeh app **fully client-side** hai (sab data `localStorage` me) — koi server function ya database nahi. Isliye Netlify pe simple static SPA ki tarah deploy hota hai.

## Quick Deploy

1. **GitHub pe push karein** (Lovable → top right → GitHub icon → Connect to GitHub).
2. Netlify dashboard → **Add new site → Import from Git** → apna repo chunein.
3. Netlify auto-detect karega `netlify.toml`. Settings:
   - **Build command:** `bun run build` (already set in `netlify.toml`)
   - **Publish directory:** `dist` (already set)
   - **Node version:** 20 (already set)
4. **Deploy site** click karein.

## Important Notes

- **Output folder**: Lovable ka default Vite config Cloudflare Workers ke liye optimize hai. Agar build `dist` me output nahi karta, to Netlify build log check karein aur `netlify.toml` me `publish` value update karein (common alternatives: `dist/client`, `.output/public`).
- **SPA routing**: `public/_redirects` aur `netlify.toml` me redirect rule hai jo har URL ko `/index.html` pe bhejta hai — TanStack Router phir client-side handle karta hai.
- **Server functions**: Agar future me `createServerFn` ya `/api/*` routes add karein, to Netlify ke liye alag adapter setup chahiye hoga (Netlify Functions). Tab Lovable hosting use karna better hoga.

## Custom Domain

Netlify dashboard → **Domain settings → Add custom domain**. DNS records Netlify automatically guide karega.

## Alternative: Lovable Hosting

App pehle se live hai: https://repair-se-aasan.lovable.app — bina kisi setup ke. Custom domain bhi Lovable me add kar sakte hain (Project Settings → Domains).
