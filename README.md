# 🛰️ AEGIS Orbital Defense

A **real-time strategic space defense game** where you protect Earth from incoming cosmic threats. Command advanced weaponry, manage resources, and defend humanity's cradle.

🎮 **[Play Now](https://kudbeezero.github.io/a-e-g-i-s-orbital-defense/)** — No installation required!

---

## 🎯 Gameplay

### Core Loop
1. **Armory** — Select your weapons and upgrades
2. **Cinematic Briefing** — Mission briefing with atmosphere
3. **Combat** — Real-time 3D space defense
4. **Upgrades** — Improve your arsenal between chapters
5. **Results** — Assess casualties and strategic gains

### Features
- **6 Threat Types**: Debris, asteroids, armored vessels, aircraft, ICBMs, and more
- **4 Weapon Systems**: Each with unique mechanics, cooldowns, and ammo management
- **3 Tactical Upgrades**: Enhance ammo capacity, reload speed, or city defenses
- **7 Cities to Protect**: Watch them survive or fall based on your performance
- **Progressive Difficulty**: Escalating chapters with increasing threat intensity
- **Combo Scoring**: Chain successful intercepts for score multipliers
- **Save/Load System**: Continue your defense across sessions

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19.1 + TypeScript 5.8 |
| **3D Graphics** | Three.js with React Three Fiber |
| **State** | Zustand + TanStack Query |
| **Build** | Vite 5.4 (< 5 second builds) |
| **Styling** | Tailwind CSS + Radix UI |
| **Code Quality** | Biome linter, TypeScript strict mode |
| **Deployment** | GitHub Pages (live), Cloudflare Pages ready |

---

## 📊 Project Status

| Component | Status | Notes |
|-----------|:------:|-------|
| Game Systems | ✅ Complete | All core gameplay implemented and tested |
| 3D Rendering | ✅ Complete | Earth, threats, weapons, visual FX |
| UI/UX | ✅ Complete | HUD, menus, weapon selector, smooth animations |
| Build Pipeline | ✅ Complete | Vite + pnpm, ~5 second builds |
| CI/CD | ✅ Active | GitHub Pages auto-deploy + quality gates |
| Backend | ⛔ Stub | ICP canister ready for future server logic |
| Tests | ⛔ None | No automated tests yet |

---

## 🏗️ Architecture

### Frontend Structure
```
src/frontend/
├── src/
│   ├── components/        # UI screens (Menu, Combat, Armory, etc.)
│   ├── store/            # Zustand game state
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Helper functions
│   ├── data/             # Game constants (weapons, threats, cities)
│   ├── lib/              # UI component library (Radix + Tailwind)
│   └── main.tsx          # Entry point
├── dist/                 # Build output (ready to deploy)
└── package.json          # Dependencies
```

### Game State (Zustand Store)
```typescript
// Core game loop phase
phase: "menu" | "armory" | "cinematic" | "combat" | "upgrade" | "result"

// Chapter progression (1–10+)
chapter: number

// City defense tracking
cities: City[]

// Combat state
threats: Threat[]
weapons: Weapon[]
selectedWeaponId: string

// Progression
upgrades: Upgrade[]
score: number
combo: number
```

---

## 🎮 How to Play

### Controls (Desktop)
- **Mouse** — Aim weapon
- **Click** — Fire weapon
- **1-4 Keys** — Switch weapons
- **R** — Reload (if available)
- **Space** — Select upgrade

### Objective
- Protect as many cities as possible
- Intercept incoming threats before they reach Earth
- Chain successful hits for combo multipliers
- Survive all 10 chapters

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js 20+
- pnpm 10+

### Installation
```bash
# Install dependencies
pnpm install

# Run dev server
pnpm -C src/frontend dev

# Build for production
pnpm -C src/frontend build

# Type checking
pnpm -C src/frontend typecheck

# Lint code
pnpm -C src/frontend check
pnpm -C src/frontend fix
```

### Dev Server
The app runs at `http://localhost:5173` with hot reload enabled.

---

## 🚀 Deployment

The game is **production-ready** and can be deployed to:

### ⭐ Recommended: Cloudflare Pages
```bash
# 1. Go to dash.cloudflare.com → Pages
# 2. Connect GitHub repo
# 3. Build command: cd src/frontend && pnpm install && pnpm build
# 4. Output directory: src/frontend/dist
# 5. Deploy!
```

### Alternative: Vercel
```bash
npm install -g vercel
vercel
```

### Current: GitHub Pages
- **Live at:** https://kudbeezero.github.io/a-e-g-i-s-orbital-defense/
- Auto-deploys on push to `main`

---

## 📈 Performance

| Metric | Value |
|--------|-------|
| **Build Time** | ~5 seconds (Vite) |
| **Bundle Size** | ~800 KB (250 KB gzipped) |
| **First Contentful Paint** | < 2 seconds (4G) |
| **Frame Rate** | 60 FPS (Three.js WebGL) |
| **TypeScript Coverage** | 100% |

---

## 🔧 Configuration

### Environment Variables (Optional)
```env
# Internet Computer network
DFX_NETWORK=ic

# Internet Identity provider
II_URL=https://identity.internetcomputer.org/

# Storage gateway
STORAGE_GATEWAY_URL=https://blob.caffeine.ai
```

All have sensible defaults; only needed for custom ICP deployments.

---

## 🎨 Visual Design

- **Color Palette**: Deep space blues with accent cyan
- **Font**: Bricolage Grotesque (UI), JetBrains Mono (HUD)
- **Theme**: Dark mode optimized (light mode ready)
- **Responsive**: Works on desktop and tablets
- **Accessibility**: WCAG 2.1 AA targeted (Radix UI components)

---

## 📝 Future Enhancements

- [ ] Multiplayer leaderboard (ICP backend)
- [ ] Audio/music and sound effects
- [ ] Mobile touch controls refinement
- [ ] Automated unit & integration tests
- [ ] Analytics and telemetry
- [ ] Additional threat types
- [ ] New weapon variants
- [ ] Campaign story progression

---

## 📄 License

MIT License — Feel free to fork, modify, and deploy!

---

## 🤝 Contributing

Contributions welcome! The project is fully typed with strict TypeScript and uses Biome for code quality.

### Before You Submit
1. Run `pnpm -C src/frontend typecheck`
2. Run `pnpm -C src/frontend check --write` (auto-fix formatting)
3. Test the build: `pnpm -C src/frontend build`

---

## 📧 Support

Found a bug? Have a suggestion? Open an issue on GitHub!

---

**Ready to defend Earth?** 🚀 [Play Now!](https://kudbeezero.github.io/a-e-g-i-s-orbital-defense/)
