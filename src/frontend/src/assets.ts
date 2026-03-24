export const ASSETS = {
  missilePlayer: "/assets/generated/missile_player.dim_256x64.png",
  missileEnemy: "/assets/generated/missile_enemy.dim_256x64.png",
  explosionStandard: "/assets/generated/explosion_standard.dim_256x256.png",
  explosionCombo: "/assets/generated/explosion_combo.dim_256x256.png",
  nearMiss: "/assets/generated/effect_near_miss.dim_256x256.png",
};

export async function preloadAssets(): Promise<void> {
  await Promise.all(
    Object.values(ASSETS).map((src) => {
      const img = new Image();
      img.src = src;
      return img.decode().catch(() => null);
    }),
  );
}
