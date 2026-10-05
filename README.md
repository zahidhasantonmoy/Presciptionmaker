# Personal Multi-Service Suite & Workspace

A central, modular personal web platform hosting multiple document generation and management tools under a single website using clean URL paths on Vercel Hobby plan.

---

## 🚀 Services & Routes Included

| Service | Route | Description |
| :--- | :--- | :--- |
| **Central Hub** | `/` | Master launcher, cross-service stats, universal data backup & restore |
| **Prescription Maker** | `/prescription` | Clinical prescription generator with drug catalog, ICD diagnosis, and QR verification |
| **Ticket Maker** | `/ticket` | Event, concert, and transit pass creator with perforated stubs and scannable QR |
| **Invoice Maker** | `/invoice` | Client billing, multi-currency, auto tax & discount computation, PDF export |
| **Certificate Maker** | `/certificate` | Framed achievement awards, diplomas, tamper verification seal, PDF export |
| **ID & Badge Maker** | `/card` | CR80 standard identification passes with photo upload and barcode |

---

## 🔐 Personal Security & Data Privacy

- **Master Passcode Barrier:** When you first launch the app, choose your private master passcode.
- **Instant Lock:** Click **Lock** in the OmniBar anytime to lock your workspace.
- **Data Privacy:** 100% local-first in browser storage. No external servers receive your records.
- **1-Click Universal Backup:** On the Central Hub, click **Backup All Data** to download all prescriptions, tickets, and invoices into a single JSON file.

---

## 🌐 Deploy to Vercel (Hobby Plan - 100% Free)

No complex DNS or subdomains required. Just deploy as a normal website:

1. Import this repository in [vercel.com](https://vercel.com).
2. Connect your custom domain (e.g. `example.com` or use Vercel's free `*.vercel.app` domain).
3. That's it! All routes (`/prescription`, `/ticket`, `/invoice`, etc.) work out of the box.

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
  path: '/resume',
  icon: '📄',
  category: 'Documents',
  accentColor: '#ec4899',
  gradient: 'linear-gradient(135deg, #ec4899 0%, #be185d 100%)',
  badge: 'New',
  isAvailable: true,
  component: ResumeMaker,
}
```
It automatically appears on the Central Hub and the top OmniBar switcher.

---

## 💻 Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173/` in your browser.
