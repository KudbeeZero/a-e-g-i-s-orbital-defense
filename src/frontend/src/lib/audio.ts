// Audio system for game sounds and music
// Infrastructure ready for sound effects (implementation optional)

export interface AudioConfig {
  volume: number;
  muted: boolean;
  effectsEnabled: boolean;
  musicEnabled: boolean;
}

class AudioSystem {
  private config: AudioConfig = {
    volume: 0.7,
    muted: false,
    effectsEnabled: true,
    musicEnabled: true,
  };

  private sounds: Map<string, HTMLAudioElement> = new Map();

  constructor() {
    this.loadConfig();
  }

  private loadConfig() {
    const saved = localStorage.getItem("aegis_audio_config");
    if (saved) {
      this.config = JSON.parse(saved);
    }
  }

  private saveConfig() {
    localStorage.setItem("aegis_audio_config", JSON.stringify(this.config));
  }

  // Play sound effect
  playEffect(effectName: string) {
    if (!this.config.effectsEnabled || this.config.muted) return;

    // Sound effects would be preloaded here
    // For now, this is infrastructure only
    console.debug(`[AUDIO] Playing effect: ${effectName}`);
  }

  // Play background music
  playMusic(trackName: string) {
    if (!this.config.musicEnabled || this.config.muted) return;

    console.debug(`[AUDIO] Playing music: ${trackName}`);
  }

  // Stop all sounds
  stopAll() {
    for (const sound of this.sounds.values()) {
      if (sound instanceof HTMLAudioElement) {
        sound.pause();
        sound.currentTime = 0;
      }
    }
  }

  // Volume control
  setVolume(volume: number) {
    this.config.volume = Math.max(0, Math.min(1, volume));
    this.saveConfig();
  }

  // Mute/unmute
  toggleMute() {
    this.config.muted = !this.config.muted;
    this.saveConfig();
  }

  // Enable/disable effects
  toggleEffects() {
    this.config.effectsEnabled = !this.config.effectsEnabled;
    this.saveConfig();
  }

  // Enable/disable music
  toggleMusic() {
    this.config.musicEnabled = !this.config.musicEnabled;
    if (!this.config.musicEnabled) {
      this.stopAll();
    }
    this.saveConfig();
  }

  getConfig() {
    return { ...this.config };
  }
}

// Singleton instance
export const audioSystem = new AudioSystem();

// Sound effect names (ready for implementation)
export const SOUND_EFFECTS = {
  WEAPON_FIRE: "weapon-fire",
  EXPLOSION: "explosion",
  SHIELD_HIT: "shield-hit",
  CITY_DESTROYED: "city-destroyed",
  LEVEL_UP: "level-up",
  COMBO_UNLOCK: "combo-unlock",
  MENU_CLICK: "menu-click",
  GAME_OVER: "game-over",
} as const;

// Music track names (ready for implementation)
export const MUSIC_TRACKS = {
  MENU: "menu-theme",
  COMBAT: "combat-theme",
  BOSS_FIGHT: "boss-fight",
  VICTORY: "victory",
  DEFEAT: "defeat",
} as const;
