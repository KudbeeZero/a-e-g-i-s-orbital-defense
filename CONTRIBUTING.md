# Contributing to AEGIS Orbital Defense

Thank you for your interest in contributing! This guide will help you get started.

## Getting Started

### Prerequisites
- Node.js 20+
- pnpm 10+ (`npm install -g pnpm`)

### Development Setup
```bash
# Install dependencies
pnpm install

# Start dev server
pnpm -C src/frontend dev

# Run quality checks
pnpm -C src/frontend typecheck
pnpm -C src/frontend check
```

## Code Standards

### TypeScript
- **Strict mode enabled** — All code must pass `pnpm typecheck` with zero errors
- Use explicit types (avoid `any`)
- Prefer `const` over `let`

### Linting & Formatting
- **Biome** handles linting and formatting
- Auto-fix before committing: `pnpm -C src/frontend check --write`

### Commit Messages
- Use imperative mood: "Add feature" not "Added feature"
- Be descriptive but concise
- Example: `feat: add combo multiplier display to HUD`

## Before You Submit

1. **Type checking**
   ```bash
   pnpm -C src/frontend typecheck
   ```

2. **Linting & formatting**
   ```bash
   pnpm -C src/frontend check --write
   ```

3. **Build verification**
   ```bash
   pnpm -C src/frontend build
   ```

4. **Test locally**
   ```bash
   pnpm -C src/frontend dev
   # Verify your changes work in the browser
   ```

## Project Structure

```
src/frontend/
├── src/
│   ├── components/          # UI screens and components
│   │   ├── MenuScreen.tsx   # Main menu with starfield
│   │   ├── CombatScreen.tsx # Real-time combat interface
│   │   ├── ArmoryScreen.tsx # Weapon selection
│   │   ├── EarthScene.tsx   # 3D Earth visualization
│   │   └── ...
│   ├── store/               # Zustand game state
│   │   └── gameStore.ts     # Single source of truth
│   ├── hooks/               # Custom React hooks
│   ├── utils/               # Helper functions
│   ├── data/                # Game constants
│   │   ├── weapons.ts       # Weapon definitions
│   │   ├── threats.ts       # Threat/enemy types
│   │   └── cities.ts        # City positions/names
│   ├── lib/                 # UI component library
│   │   └── (Radix UI re-exports)
│   ├── index.css            # Global styles & animations
│   ├── main.tsx             # Entry point
│   └── App.tsx              # Root component
├── vite.config.js           # Build configuration
└── package.json             # Dependencies
```

## Key Concepts

### Game State Machine
The game flows through 5 phases:
1. **menu** — Main menu with starfield background
2. **armory** — Weapon/upgrade selection
3. **cinematic** — Briefing scene
4. **combat** — Real-time 3D combat
5. **upgrade** → **result** → back to **menu**

Use `useGameStore()` to access and modify state:
```typescript
const { phase, setPhase, weapons, score } = useGameStore();
```

### 3D Rendering (Three.js)
- Uses React Three Fiber for declarative 3D
- **EarthScene.tsx** renders the 3D globe with threats
- Threats are simple geometries (capsules, cubes)
- Post-processing: bloom + ACES tone mapping

### Styling
- **Tailwind CSS** for layout & utilities
- **Radix UI** for accessible components
- **Game-specific colors** defined in `index.css`:
  - Cyan (`#00e5ff`) — primary UI
  - Amber (`#ffaa00`) — warnings/secondary
  - Green (`#00ff88`) — success states
  - Danger (`#ff3333`) — destruction/threats

## Common Tasks

### Adding a New Game Component
```typescript
// src/frontend/src/components/MyComponent.tsx
import { useGameStore } from "../store/gameStore";

export default function MyComponent() {
  const phase = useGameStore((s) => s.phase);
  
  return <div>{/* component content */}</div>;
}
```

### Adding Game Constants
```typescript
// src/frontend/src/data/myConstants.ts
export const MY_CONSTANT = {
  value: 42,
  description: "A meaningful constant",
};
```

### Adding a Store Action
```typescript
// In gameStore.ts, add to the create() function:
setMyValue: (value: number) => 
  set((state) => ({ myValue: value })),
```

## Testing Your Changes

1. **Type safety** — `pnpm typecheck` catches errors at compile time
2. **Visual inspection** — Run the dev server and manually test
3. **Browser DevTools** — Inspect component props, state changes
4. **Console logs** — Use sparingly; remove before committing

## Performance Tips

- Avoid unnecessary re-renders: use `useCallback` and memoization
- Lazy-load components if possible
- Keep Three.js draw calls under 100
- Profile with browser DevTools Performance tab

## Reporting Issues

Found a bug? Have a feature request?
- Open an issue with a clear description
- Include reproduction steps if applicable
- Add screenshots/videos if relevant

## Code Review Guidelines

PRs are reviewed for:
- **Correctness** — Does it work as intended?
- **Type safety** — TypeScript strict mode compliance
- **Code quality** — Readability, maintainability
- **Performance** — No unnecessary re-renders or draw calls
- **Accessibility** — Proper ARIA labels (Radix UI helps here)

## Questions?

Feel free to open a discussion or issue if you're unsure about anything!

---

**Happy coding! 🚀** Thanks for helping defend Earth!
