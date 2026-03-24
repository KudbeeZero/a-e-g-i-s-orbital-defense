import { useGameStore } from "../store/gameStore";
import type { WeaponType } from "../store/gameStore";

const WEAPONS: {
  id: WeaponType;
  name: string;
  icon: string;
  color: string;
}[] = [
  { id: "heat-seeker", name: "HEAT-SEEKER", icon: "🎯", color: "#00e5ff" },
  { id: "cluster", name: "CLUSTER", icon: "💥", color: "#ffaa00" },
  { id: "prox-burst", name: "PROX-BURST", icon: "⚡", color: "#aa44ff" },
  { id: "kinetic", name: "KINETIC", icon: "⬡", color: "#ffffff" },
];

const OCID_MAP: Record<WeaponType, string> = {
  "heat-seeker": "weapon.button.1",
  cluster: "weapon.secondary_button.2",
  "prox-burst": "weapon.toggle.3",
  kinetic: "weapon.button.4",
};

export default function WeaponSelector() {
  const selectedWeapon = useGameStore((s) => s.selectedWeapon);
  const setSelectedWeapon = useGameStore((s) => s.setSelectedWeapon);
  const ammo = useGameStore((s) => s.ammo);
  const cooldowns = useGameStore((s) => s.cooldowns);
  const now = Date.now();

  return (
    <div className="flex gap-1.5">
      {WEAPONS.map((w) => {
        const isSelected = selectedWeapon === w.id;
        const remaining = ammo[w.id];
        const cooldownReady = cooldowns[w.id] <= now;
        const cooldownLeft = Math.max(0, (cooldowns[w.id] - now) / 1000);

        return (
          <button
            type="button"
            key={w.id}
            data-ocid={OCID_MAP[w.id]}
            onClick={() => setSelectedWeapon(w.id)}
            className="flex flex-col items-center px-2 py-2 border transition-all duration-150 relative min-w-[64px]"
            style={{
              background: isSelected ? `${w.color}18` : "rgba(0,5,20,0.7)",
              borderColor: isSelected ? w.color : "rgba(255,255,255,0.12)",
              boxShadow: isSelected
                ? `0 0 8px ${w.color}60, inset 0 0 6px ${w.color}10`
                : "none",
              opacity: remaining <= 0 ? 0.4 : 1,
            }}
          >
            <span className="text-lg leading-none">{w.icon}</span>
            <span
              className="font-hud font-bold mt-1"
              style={{
                color: isSelected ? w.color : "rgba(255,255,255,0.5)",
                fontSize: "8px",
                letterSpacing: "0.05em",
              }}
            >
              {w.name}
            </span>
            <span
              className="font-hud mt-0.5"
              style={{
                color: isSelected ? w.color : "rgba(255,255,255,0.35)",
                fontSize: "10px",
              }}
            >
              ×{remaining}
            </span>
            {!cooldownReady && (
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.6)" }}
              >
                <span className="font-hud text-xs" style={{ color: w.color }}>
                  {cooldownLeft.toFixed(1)}s
                </span>
              </div>
            )}
            {isSelected && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5"
                style={{ background: w.color, boxShadow: `0 0 4px ${w.color}` }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
