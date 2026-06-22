import { MAX_LOADOUT, WEAPON_LIST } from "../data/weapons";
import { useGameStore } from "../store/gameStore";

const STARS = Array.from({ length: 150 }, (_, i) => ({
  id: `arm-${i}`,
  left: (i * 17.3) % 100,
  top: (i * 13.7) % 100,
  w: (i % 3) + 1,
  opacity: 0.2 + (i % 5) * 0.1,
}));

export default function ArmoryScreen() {
  const credits = useGameStore((s) => s.credits);
  const ownedWeapons = useGameStore((s) => s.ownedWeapons);
  const loadout = useGameStore((s) => s.loadout);
  const unlockWeapon = useGameStore((s) => s.unlockWeapon);
  const toggleLoadout = useGameStore((s) => s.toggleLoadout);
  const setPhase = useGameStore((s) => s.setPhase);
  const saveToStorage = useGameStore((s) => s.saveToStorage);

  const handleUnlock = (id: (typeof WEAPON_LIST)[number]["id"]) => {
    if (unlockWeapon(id)) saveToStorage();
  };

  const handleToggle = (id: (typeof WEAPON_LIST)[number]["id"]) => {
    toggleLoadout(id);
    saveToStorage();
  };

  const handleBack = () => {
    saveToStorage();
    setPhase("menu");
  };

  return (
    <div
      className="relative w-screen h-screen flex flex-col items-center overflow-y-auto py-10 px-6"
      style={{ background: "#000214" }}
    >
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.w}px`,
              height: `${s.w}px`,
              background: "white",
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        <div className="text-center mb-2">
          <div
            className="font-hud text-xs tracking-[0.4em] mb-2"
            style={{ color: "#00ff88", opacity: 0.8 }}
          >
            WEAPON STASH
          </div>
          <h1
            className="font-display font-black text-4xl sm:text-5xl tracking-tight"
            style={{
              color: "#00e5ff",
              textShadow: "0 0 20px rgba(0,229,255,0.5)",
            }}
          >
            ARMORY
          </h1>
        </div>

        <div className="flex items-center justify-center gap-6 mb-8 mt-4 font-hud text-sm">
          <div style={{ color: "#ffaa00" }}>
            CREDITS:{" "}
            <span className="font-bold">{credits.toLocaleString()}</span>
          </div>
          <div style={{ color: "rgba(0,229,255,0.7)" }}>
            LOADOUT:{" "}
            <span className="font-bold">
              {loadout.length} / {MAX_LOADOUT}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {WEAPON_LIST.map((w) => {
            const owned = ownedWeapons.includes(w.id);
            const equipped = loadout.includes(w.id);
            const canAfford = credits >= w.unlockCost;
            const loadoutFull = loadout.length >= MAX_LOADOUT;

            return (
              <div
                key={w.id}
                className="border-2 p-4 flex flex-col"
                style={{
                  background: equipped ? `${w.color}12` : "rgba(0,5,20,0.8)",
                  borderColor: equipped
                    ? w.color
                    : owned
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(255,255,255,0.07)",
                  boxShadow: equipped ? `0 0 14px ${w.color}40` : "none",
                  opacity: owned ? 1 : 0.85,
                }}
              >
                <div className="flex items-start gap-3 mb-2">
                  <span className="text-2xl leading-none">{w.icon}</span>
                  <div className="flex-1">
                    <div
                      className="font-hud font-bold text-sm"
                      style={{ color: w.color, letterSpacing: "0.08em" }}
                    >
                      {w.name}
                    </div>
                    <div
                      className="font-hud"
                      style={{
                        color: "rgba(255,255,255,0.45)",
                        fontSize: "10px",
                        marginTop: "2px",
                      }}
                    >
                      {w.desc}
                    </div>
                  </div>
                </div>

                <div
                  className="flex gap-3 font-hud mb-3"
                  style={{ color: "rgba(255,255,255,0.45)", fontSize: "10px" }}
                >
                  <span>AMMO {w.baseAmmo}</span>
                  <span>CD {(w.cooldownMs / 1000).toFixed(1)}s</span>
                  {w.projectiles > 1 && <span>×{w.projectiles} SHOT</span>}
                </div>

                <div className="mt-auto">
                  {owned ? (
                    <button
                      type="button"
                      data-ocid={`armory.loadout.${w.id}`}
                      onClick={() => handleToggle(w.id)}
                      disabled={!equipped && loadoutFull}
                      className="w-full py-2 font-hud font-bold border transition-all"
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.12em",
                        background: equipped
                          ? `${w.color}20`
                          : "rgba(0,229,255,0.05)",
                        borderColor: equipped ? w.color : "rgba(0,229,255,0.3)",
                        color: equipped ? w.color : "rgba(0,229,255,0.7)",
                        opacity: !equipped && loadoutFull ? 0.35 : 1,
                        cursor:
                          !equipped && loadoutFull ? "not-allowed" : "pointer",
                      }}
                    >
                      {equipped
                        ? "✓ IN LOADOUT"
                        : loadoutFull
                          ? "LOADOUT FULL"
                          : "+ ADD TO LOADOUT"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      data-ocid={`armory.unlock.${w.id}`}
                      onClick={() => handleUnlock(w.id)}
                      disabled={!canAfford}
                      className="w-full py-2 font-hud font-bold border transition-all"
                      style={{
                        fontSize: "11px",
                        letterSpacing: "0.12em",
                        background: canAfford
                          ? "rgba(255,170,0,0.1)"
                          : "rgba(50,50,50,0.3)",
                        borderColor: canAfford
                          ? "#ffaa00"
                          : "rgba(120,120,120,0.3)",
                        color: canAfford ? "#ffaa00" : "rgba(150,150,150,0.5)",
                        cursor: canAfford ? "pointer" : "not-allowed",
                      }}
                    >
                      🔒 UNLOCK — {w.unlockCost.toLocaleString()} CR
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-center pb-6">
          <button
            type="button"
            data-ocid="armory.back_button"
            onClick={handleBack}
            className="px-12 py-4 font-hud font-bold text-base tracking-[0.2em] border-2 transition-all"
            style={{
              background: "rgba(0,229,255,0.1)",
              borderColor: "#00e5ff",
              color: "#00e5ff",
            }}
          >
            ◄ BACK TO MENU
          </button>
        </div>
      </div>
    </div>
  );
}
