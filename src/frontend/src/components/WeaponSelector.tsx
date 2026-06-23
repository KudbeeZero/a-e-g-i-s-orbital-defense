import { WEAPONS } from "../data/weapons";
import { useGameStore } from "../store/gameStore";

export default function WeaponSelector() {
  const selectedWeapon = useGameStore((s) => s.selectedWeapon);
  const setSelectedWeapon = useGameStore((s) => s.setSelectedWeapon);
  const loadout = useGameStore((s) => s.loadout);
  const ammo = useGameStore((s) => s.ammo);
  const cooldowns = useGameStore((s) => s.cooldowns);
  const now = Date.now();

  return (
    <div className="flex gap-1.5">
      {loadout.map((id, index) => {
        const w = WEAPONS[id];
        const isSelected = selectedWeapon === id;
        const remaining = ammo[id];
        const cooldownReady = cooldowns[id] <= now;
        const cooldownLeft = Math.max(0, (cooldowns[id] - now) / 1000);

        return (
          <button
            type="button"
            key={id}
            data-ocid={`weapon.button.${index + 1}`}
            onClick={() => setSelectedWeapon(id)}
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
            <span
              className="font-hud absolute top-0.5 left-1"
              style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: "8px",
              }}
            >
              {index + 1}
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
