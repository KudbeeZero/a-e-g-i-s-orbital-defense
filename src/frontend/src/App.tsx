import { useEffect } from "react";
import CinematicScreen from "./components/CinematicScreen";
import CombatScreen from "./components/CombatScreen";
import MenuScreen from "./components/MenuScreen";
import ResultScreen from "./components/ResultScreen";
import UpgradeScreen from "./components/UpgradeScreen";
import { useGameStore } from "./store/gameStore";

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const loadFromStorage = useGameStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  if (phase === "menu") return <MenuScreen />;
  if (phase === "cinematic") return <CinematicScreen />;
  if (phase === "combat") return <CombatScreen />;
  if (phase === "upgrade") return <UpgradeScreen />;
  return <ResultScreen />;
}
