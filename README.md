# 🕌 Namazly Client — Frontend Web Application

## 🌐 Live Web Application: [https://namazly.in](https://namazly.in)

**Namazly** is a beautiful, privacy-first, and distraction-free **Qaza Namaz Calculator and Manager** designed to help Muslims easily calculate, record, and steadily fulfill their missed prayers (salah). 

Visit the live app: 🚀 **[namazly.in](https://namazly.in)**

### 🔍 Search Keywords & SEO Tags
* **Missed Prayers Tracker**: Fulfill your Qaza-e-Umri with a beautiful visual interface.
* **Qaza Namaz Calculator Online**: Easily calculate missed salah based on puberty years, with automatic menstruation cycle deductions for sisters.
* **Islamic Prayer Manager**: Clean, distraction-free, privacy-focused guest storage with zero cookies and optional Google Cloud sync.
* **Hanafi & Standard Madhhab Timings**: Dynamic geolocation-based prayer timings.

---

## 📡 Backend Server Repository
This repository contains only the client-side user interface. The backend API server is hosted in a separate repository on GitHub. If you are setting up the full application, you will need to clone and run the server in parallel:
👉 **[Namazly Backend Server Repository](https://github.com/maaz80/namazly-backend)**

---

## 🎯 Purpose & Design Philosophy
Maintaining a long-term record of missed prayers (Qaza-e-Umri) can feel overwhelming. The Namazly client is designed to minimize friction and make the journey rewarding:
* **Calming Visuals**: Utilizes a customized HSL-tailored color palette centered around organic sage-green (`#3d8265`), warm cream (`#f5f0e8`), and soft gold accents.
* **Premium Glassmorphism**: Cards and navigation bars feature frosted-glass layers (`backdrop-blur(24px)`) and subtle white border overlays to feel premium, state-of-the-art, and modern.
* **Micro-interactions**: Hover effects, smooth slides, and instant UI response with auto-saving debounced in the background to prevent server overload.

---

## 🛠️ Detailed Page & Component Breakdown

### 1. 🎛️ Dashboard (`Dashboard.jsx`)
* **Qaza Salah Tracker**: Displaying Fajr, Dhuhr, Asr, Maghrib, Isha, and Witr counts. Features inline `+` and `-` buttons that run micro-animations.
* **Smart Qaza Calculator**: Opens a frosted-glass overlay where users input years, months, or custom days of missed prayers. It includes menstrual cycle exclusions for sisters and computes final counts instantly.
* **Stats Summary Card**: Displays complete pending Salah counts, total pending Rakats (unit of prayer), and interactive progress bars indicating the overall completion percentage.
* **SEO Articles Carousel**: An auto-scrolling slider changing slides every 8 seconds. Configured with fixed heights (`min-h-[350px] sm:min-h-[260px] md:min-h-[220px]`) to completely prevent Layout Shifts (CLS). Contains crawlable semantic HTML with Qaza-focused SEO keywords for search engine discovery.

### 2. 📅 Islamic Calendar (`CalendarPage.jsx`)
* **Dual View**: Renders the standard Gregorian dates alongside Hijri dates.
* **Moonsighting Adjuster**: A manual date offset selector (-2 to +2 days) to synchronize Hijri dates with local community sightings.
* **Holy Days Indicator**: Highlights critical Islamic holidays (Ramadan, Eid, Ashura) with visual badges and descriptive hover tooltips.

### 3. ⏰ Geolocation Prayer Timings (`TimingsPage.jsx`)
* **GPS Auto-Detection**: Uses browser geolocation APIs to discover local coordinates and fetch timings dynamically via Aladhan API. Also supports manual city/country search.
* **Live Countdown**: A real-time ticking clock displaying a countdown (hours, minutes, seconds) until the next upcoming prayer period.

### 4. 📖 Hadith of the Day (`HadithPage.jsx`)
* Curates a daily authentic Hadith in both Arabic script and English translation.
* Integrates native Web Share APIs and copy-to-clipboard functionalities for easy sharing.

### 5. 🔒 Legal Pages (`PrivacyPage.jsx` & `DisclaimerPage.jsx`)
* **Privacy Policy**: Details our privacy-first stance, including cookieless guest storage and Google OAuth cloud syncing.
* **Disclaimer**: Explains calculation estimations, madhhab differences (Hanafi, Shafi'i, etc.), and geolocation timing references.

---

## 🚀 Advanced Client Technologies

### 1. Progressive Web App (PWA)
* Fully installable on iOS, Android, and Desktop as a standalone application.
* **Service Worker (`sw.js`)**: Runs a Network-First fallback-to-cache strategy. Offline guest users can record their salah, and database sync automatically re-triggers once an internet connection is established.
* Custom PWA installation modal prompt (`InstallPwaModal.jsx`).

### 2. Dynamic SEO Meta Tags Hook (`usePageMeta.js`)
* Every sub-page triggers this custom hook on load to update:
  * Document Title
  * Meta Description
  * Open Graph metadata (`og:title`, `og:description`, `og:url`)
  * Twitter card metadata
  * Dynamic Canonical link (`<link rel="canonical">` is automatically generated and injected into the `<head>` if missing, pointing to the exact sub-page, e.g., `/privacy-policy`).

---

## 📁 Folder Structure
```text
client/
├── package.json                # Front-end dependencies and build scripts
├── vite.config.js              # Vite bundler options and manual vendors split config
├── tailwind.config.js          # Tailwind custom color palettes and theme configurations
├── index.html                  # HTML entry point (contains favicons, preloaded Google fonts)
├── public/                     # Static PWA and indexing files
│   ├── sw.js                   # Caching service worker
│   ├── sitemap.xml             # XML Sitemap for indexing sub-pages
│   ├── robots.txt              # robots.txt configuration
│   └── icon-192.png            # 192x192px Google Search favicon compliant icon
└── src/
    ├── main.jsx                # App bootstrap mounting point
    ├── App.jsx                 # Lazy route mapping and protected redirects
    ├── index.css               # Global glass card styles and Tailwind overrides
    ├── context/
    │   └── AuthContext.jsx     # Manages login token caching and session synchronization
    ├── hooks/
    │   ├── useDebounce.js      # Debounces API save requests (saves database bandwidth)
    │   └── usePageMeta.js      # Handles dynamic meta tagging for SEO
    ├── utils/
    │   ├── api.js              # Axios setup (points to localhost:5000 in development)
    │   └── avatar.js           # Dynamic WebP Google avatar URL optimizer
    ├── components/
    │   ├── Navbar.jsx          # Mobile-first responsive header navigation
    │   ├── Footer.jsx          # Centralized footer component linked across pages
    │   ├── PrayerTracker.jsx   # Individual tracker grids
    │   └── QazaCalculator.jsx  # Estimation inputs + confirmation modals
    └── pages/
        ├── Dashboard.jsx       # Dashboard containing calculator and articles
        ├── CalendarPage.jsx    # Dual calendar
        ├── TimingsPage.jsx     # Geolocation Namaz schedules
        ├── HadithPage.jsx      # Hadith carousel
        ├── ReviewsPage.jsx     # Feedback submission forms
        ├── PrivacyPage.jsx     # Legal privacy disclosure
        └── DisclaimerPage.jsx  # Juridical disclaimers
```

---

## 🚀 Local Installation & Setup

### 1. Set Up Google Cloud Project
1. Create a project on the [Google Cloud Console](https://console.cloud.google.com/).
2. Setup your OAuth consent screen and create a **Web application Client ID**.
3. Add `http://localhost:5173` to the Authorized JavaScript Origins.

### 2. Configure Environment Variables
Create a `.env` file in the `client/` root folder:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
```

### 3. Install Packages
```bash
cd client
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser. (Note: Make sure your server backend is running in parallel on `http://localhost:5000` to support login and cloud database features).

---

## 📦 Production Compiling
To build optimized, minified assets for web hosting:
```bash
npm run build
```
This generates a `client/dist/` directory which can be deployed directly to static hosting platforms like Vercel, Netlify, or Cloudflare Pages.
