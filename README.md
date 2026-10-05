# Personal Multi-Service Suite & Workspace

A central, modular web platform hosting multiple personal document generation and management tools under a single project with multi-subdomain routing on Vercel Hobby plan.

---

## 🚀 Live Services Included

| Service | Subdomain | Description |
| :--- | :--- | :--- |
| **Central Hub** | `example.com` | Master launcher, cross-service stats, universal data backup & restore |
| **Prescription Maker** | `prescription.example.com` | Clinical prescription generator with drug catalog, ICD diagnosis, and QR verification |
| **Ticket Maker** | `ticket.example.com` | Event, concert, and transit pass creator with perforated stubs and scannable QR |
| **Invoice Maker** | `invoice.example.com` | Client billing, multi-currency, auto tax & discount computation, PDF export |
| **Certificate Maker** | `certificate.example.com` | Elegant achievement awards, diplomas, tamper verification seal, PDF export |
| **ID & Badge Maker** | `card.example.com` | CR80 standard identification passes with photo upload and barcode |

---

## 🔐 Personal Security & Cross-Subdomain Auth

- **Master Passcode Barrier:** When you first launch the app, choose your private master passcode.
- **Cross-Subdomain Session:** The authenticated session cookie is shared across `.example.com`, so unlocking once at `example.com` automatically unlocks `prescription.example.com`, `ticket.example.com`, etc.
- **Instant Lock:** Click **Lock** in the OmniBar anytime to lock your workspace.
- **Data Privacy:** 100% local-first in browser storage. No third-party servers see your data.
- **1-Click Universal Backup:** On the Central Hub, click **Backup Data** to download all prescriptions, tickets, and invoices into a single JSON file.

---

## 🌐 Subdomain & Vercel Configuration Guide

### 1. In Vercel (Hobby Plan - Free)
1. Deploy this single repository to Vercel.
2. In your Vercel Dashboard, go to **Project Settings → Domains**.
3. Add your main domain:
   - `example.com`
   - `www.example.com`
4. Add your service subdomains:
   - `prescription.example.com`
   - `ticket.example.com`
   - `invoice.example.com`
   - `certificate.example.com`
   - `card.example.com`

All subdomains point to the **same Vercel deployment**. The app automatically detects which service to display based on `window.location.hostname`.

### 2. In your DNS Provider (Cloudflare / Namecheap / GoDaddy)
Add `CNAME` records pointing to Vercel:
- `CNAME` `prescription` → `cname.vercel-dns.com`
- `CNAME` `ticket` → `cname.vercel-dns.com`
- `CNAME` `invoice` → `cname.vercel-dns.com`
- `CNAME` `certificate` → `cname.vercel-dns.com`
- `CNAME` `card` → `cname.vercel-dns.com`

---

## 🧩 How to Add a New Service in 2 Steps

Adding a future service is plug-and-play without rebuilding the core platform:

### Step 1: Create your service component
Create a directory under `src/services/<service-name>/` (e.g. `src/services/resume/ResumeMaker.tsx`).

### Step 2: Register it in `src/services/registry.ts`
Add an entry to `SERVICES_REGISTRY`:
```typescript
{
  id: 'resume',
  name: 'Resume Builder',
  tagline: 'ATS-Friendly CV Generator',
  description: 'Design professional developer and executive resumes with instant PDF export.',
  subdomain: 'resume',
  icon: '📄',
  category: 'Documents',
  accentColor: '#ec4899',
  gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  badge: 'New',
  isAvailable: true,
  component: ResumeMaker,
}
```
That's it! It automatically appears on the Hub Dashboard, the top OmniBar switcher, and activates when `resume.example.com` or `/?service=resume` is visited.

---

## 💻 Local Development

```bash
npm install
npm run dev
```

During local development on `localhost:5173`:
- Hub: `http://localhost:5173/`
- Prescription: `http://localhost:5173/?service=prescription`
- Ticket Maker: `http://localhost:5173/?service=ticket`
- Invoice Maker: `http://localhost:5173/?service=invoice`
- Certificate Maker: `http://localhost:5173/?service=certificate`
- ID Card Maker: `http://localhost:5173/?service=idcard`
