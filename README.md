# EasyPad – Professional Medical Prescription Software

**EasyPad** is a fast, modern, privacy-first prescription writing tool designed specifically for doctors in **Bangladesh**. It runs entirely in the browser with no server or database required — all data is stored locally.

---

## ✨ Features

- **⚡ Fast Prescription Builder** — Create complete prescriptions with minimal clicks
- **💊 Medicine Entry System** — Autocomplete from your personal catalog, dose grid (1+0+1), favorites, templates
- **🩺 Diagnosis & Tests** — Autocomplete, favorites, Bengali/English support
- **📋 Prescription Templates** — Save and reuse complete prescription patterns
- **📄 Live A4 Preview** — See the exact prescription as it will print while you type
- **🖨️ Print & PDF Export** — Direct browser print + jsPDF download with full Bengali support
- **🇧🇩 Bengali Support** — UI, prescription, and PDF all support Bangla text with Noto Sans Bengali font
- **👨‍⚕️ Doctor Profile** — Bilingual (English + বাংলা) header on prescriptions
- **🏥 4 Prescription Themes** — Classic, Minimal, Modern, Compact
- **📜 Prescription History** — Search, view, duplicate, reuse, reprint
- **💾 Local Data Backup** — Export/import all data as JSON
- **🔒 Privacy-first** — Nothing leaves your browser

---

## 🚀 Quick Start (Local Development)

### Prerequisites

- Node.js 18+
- npm 9+

### Setup

```bash
# Clone or download the project
cd presciptionmaker

# Install dependencies
npm install

# Start development server
npm run dev
```

Open **http://localhost:5173** in your browser.

### First Use

1. Go to **Settings** → fill in your doctor profile (name, degrees, specialty, BMDC number, clinic)
2. Click **New Prescription** to start your first prescription
3. Enter patient info, add diagnoses, medicines, tests, and advice
4. Use the live A4 preview on the right to see the final prescription
5. Click **Print/PDF** to print or download

---

## 📦 Build for Production

```bash
npm run build
```

The `dist/` folder is ready to deploy.

---

## 🌐 Deploy to Vercel (Free)

1. Push the project to a GitHub repository
2. Go to [vercel.com](https://vercel.com) → New Project
3. Import your repository
4. Vercel auto-detects Vite — click **Deploy**

The `vercel.json` is already configured for SPA routing.

---

## 🗂️ Project Structure

```
src/
├── types/          # TypeScript interfaces for all data models
├── store/          # Zustand store with localStorage persistence
├── data/           # Default catalogs and demo templates
├── utils/          # Date utils (Asia/Dhaka timezone)
├── components/
│   ├── layout/     # Sidebar navigation
│   ├── prescription/ # PrescriptionPreview, MedicineEntry, etc.
│   └── ui/         # Toast, Modal, AutocompleteInput
└── pages/          # Dashboard, Builder, History, Templates, Settings
```

---

## 🔒 Privacy & Data

- All prescriptions, patient data, and settings are stored in **browser localStorage only**
- Nothing is transmitted to any server
- Use **Settings → Export Backup** to save your data as a JSON file
- Clear browser data warning: clearing browser storage deletes all prescriptions

---

## 🏥 Technology Stack

| Technology | Purpose |
|---|---|
| React 19 + TypeScript | UI framework |
| Vite 8 | Build tool |
| Tailwind CSS v4 | Styling |
| Zustand | State management + persistence |
| date-fns + date-fns-tz | Bangladesh timezone handling |
| jsPDF + html2canvas | PDF generation |
| Noto Sans Bengali | Bengali font |
| lucide-react | Icons |

---

## ⚠️ Important Disclaimer

EasyPad is a **prescription documentation tool** for licensed medical doctors.

- It does **not** recommend, diagnose, or prescribe medicines autonomously
- All medicine, diagnosis, and treatment decisions are made entirely by the doctor
- The autocomplete suggestions come **only** from the doctor's own catalog entries

---

## 📋 Keyboard Shortcuts

| Action | Shortcut |
|---|---|
| Save prescription | `Ctrl+S` (click Save button) |
| Navigate autocomplete | `↑ ↓ Enter Escape` |
| Tab through form | `Tab` |

---

*Made for Bangladeshi doctors. Built with ❤️ using EasyPad.*
