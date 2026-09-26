import { Suspense, lazy, useEffect } from "react";
import LoadingScreen from "./components/LoadingScreen";
import MenuScreen from "./components/MenuScreen";
import { useGameStore } from "./store/gameStore";

// Lazy load heavy game screens for better initial load time
const ArmoryScreen = lazy(() => import("./components/ArmoryScreen"));
const CinematicScreen = lazy(() => import("./components/CinematicScreen"));
const CombatScreen = lazy(() => import("./components/CombatScreen"));
const ResultScreen = lazy(() => import("./components/ResultScreen"));
const UpgradeScreen = lazy(() => import("./components/UpgradeScreen"));

export default function App() {
  const phase = useGameStore((s) => s.phase);
  const loadFromStorage = useGameStore((s) => s.loadFromStorage);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  // Menu screen doesn't need lazy loading - it's critical
  if (phase === "menu") return <MenuScreen />;

  // All other screens lazy load with loading fallback
  return (
    <Suspense fallback={<LoadingScreen />}>
      {phase === "armory" && <ArmoryScreen />}
      {phase === "cinematic" && <CinematicScreen />}
      {phase === "combat" && <CombatScreen />}
      {phase === "upgrade" && <UpgradeScreen />}
      {phase === "gameover" && <ResultScreen />}
    </Suspense>
  );
}
