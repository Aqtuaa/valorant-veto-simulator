# Valorant Map Veto Simulator

A standalone, offline-ready frontend web application simulating official competitive Valorant map vetoes and map selection protocols.

Built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, and **Framer Motion**.

---

## Features

- **Format Protocols**:
  - **Bo1**: Single-match sudden death with an animated SVG spin wheel with physics easing and uniform cryptographic distribution (`crypto.getRandomValues`).
  - **Bo3 (Competitive)**: Standard 7-map tournament veto (2 bans, 2 picks, 2 bans, with the remaining 7th map automatically designated as the Decider).
  - **Bo5 (Grand Finals)**: Extended championship sequence (2 bans, 4 picks, 7th map as Decider).
- **Coin Toss Protocol**: 3D animated coin flip to fairly determine whether Team A or Team B acts first (with an option to bypass and set manually).
- **Tactical UI/UX**:
  - Valorant-inspired aesthetic: dark charcoal background (`#0f1923`), red (`#FF4655`) and cyan (`#00F5D4`) accents, angular cut clip-paths, tactical crosshairs, and subtle scanlines.
  - Interactive map cards with rich styling and zero external image dependencies.
  - Double-check confirmation modal for every ban/pick to prevent accidental misclicks.
  - Live timeline sidebar tracking all veto actions step by step.
  - Complete **Undo** functionality to revert previous actions.
- **Match Results & Export**:
  - Displays final map schedule in exact order (Map 1, Map 2, Decider) along with pick ownership and banned maps.
  - **Copy Result** button to instantly generate clean, formatted summaries ready for Discord, stream overlays, or tournament logs.
- **Accessibility & Performance**:
  - Keyboard accessible (Tab navigation, Enter/Space action triggers, Escape to dismiss dialogs).
  - Web Audio API synthetic sound engine with zero external audio assets and instant mute toggle.
  - 100% offline-ready with no backend or external API dependencies.

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm / yarn

### Installation & Development
```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev

# 3. Build for production
npm run build

# 4. Preview the production build
npm run preview

# 5. Run automated tests
npm run test
```

---

## Deploy ke GitHub Pages

Aplikasi ini **100% frontend murni**, jadi sangat mudah dideploy ke GitHub Pages secara gratis! Sudah disiapkan konfigurasi `base: './'` di `vite.config.ts` dan workflow otomatis di `.github/workflows/deploy.yml`.

### Cara Deploy Otomatis (GitHub Actions):
1. Buat repository baru di akun GitHub Anda (misal: `valorant-veto-simulator`).
2. Push source code ini ke repository tersebut:
   ```bash
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<USERNAME>/<REPO_NAME>.git
   git push -u origin main
   ```
3. Buka repository Anda di GitHub browser:
   - Masuk ke tab **Settings** > **Pages** (di menu sebelah kiri).
   - Di bagian **Build and deployment** > **Source**, pilih **GitHub Actions**.
4. GitHub Actions akan otomatis menjalankan build dan aplikasi Anda langsung live di:
   `https://<USERNAME>.github.io/<REPO_NAME>/`

---

## Customization Guide

### How to Edit the Map Pool
The map pool is configured in a single, dedicated configuration file:
👉 [`src/config/maps.ts`](file:///src/config/maps.ts)

To swap, add, or remove maps:
```typescript
export const MAP_POOL: MapItem[] = [
  {
    id: 'abyss',
    name: 'Abyss',
    location: 'Svalbard, Arctic Ocean',
    accentColor: '#1e88e5',
    secondaryColor: '#0d47a1',
    theme: {
      bgGradient: 'from-[#0b192c] via-[#102a43] to-[#0a1128]',
      overlayGradient: 'from-blue-600/20 to-sky-950/80',
      iconSymbol: 'ABYSS // 01',
    },
    // Optional: provide a custom image URL or asset
    // imageUrl: '/maps/abyss.webp',
  },
  // ...
];
```
> If `imageUrl` is omitted, the app renders a stylized gradient card with unique tactical vector patterns for that map.

### How to Edit the Veto Sequences
Veto sequences are defined declaratively as data-driven arrays in:
👉 [`src/config/vetoSequences.ts`](file:///src/config/vetoSequences.ts)

```typescript
export const VETO_SEQUENCES = {
  bo3: [
    { actor: 'A', action: 'ban', description: 'Team A Ban' },
    { actor: 'B', action: 'ban', description: 'Team B Ban' },
    { actor: 'A', action: 'pick', description: 'Team A Pick (Map 1)' },
    { actor: 'B', action: 'pick', description: 'Team B Pick (Map 2)' },
    { actor: 'A', action: 'ban', description: 'Team A Ban' },
    { actor: 'B', action: 'ban', description: 'Team B Ban' },
    // When 1 map remains, it automatically becomes the Decider
  ],
  bo5: [
    { actor: 'A', action: 'ban', description: 'Team A Ban' },
    { actor: 'B', action: 'ban', description: 'Team B Ban' },
    { actor: 'A', action: 'pick', description: 'Team A Pick (Map 1)' },
    { actor: 'B', action: 'pick', description: 'Team B Pick (Map 2)' },
    { actor: 'A', action: 'pick', description: 'Team A Pick (Map 3)' },
    { actor: 'B', action: 'pick', description: 'Team B Pick (Map 4)' },
    // When 1 map remains, it automatically becomes the Decider
  ],
};
```
Actor `'A'` represents the team that won the coin toss (or was selected first), while Actor `'B'` is the opposing team.

---

## License
MIT
