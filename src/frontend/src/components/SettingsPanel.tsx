// In-game settings panel for audio, accessibility, and graphics
import { useState } from "react";
import { audioSystem } from "../lib/audio";
import { metricsSystem } from "../lib/metrics";

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const [audioConfig, setAudioConfig] = useState(audioSystem.getConfig());
  const [metrics, setMetrics] = useState(metricsSystem.getMetrics());

  const handleVolumeChange = (volume: number) => {
    audioSystem.setVolume(volume);
    setAudioConfig(audioSystem.getConfig());
  };

  const handleToggleMute = () => {
    audioSystem.toggleMute();
    setAudioConfig(audioSystem.getConfig());
  };

  const handleToggleEffects = () => {
    audioSystem.toggleEffects();
    setAudioConfig(audioSystem.getConfig());
  };

  const handleToggleMusic = () => {
    audioSystem.toggleMusic();
    setAudioConfig(audioSystem.getConfig());
  };

  const handleResetMetrics = () => {
    if (confirm("Reset all game statistics?")) {
      metricsSystem.reset();
      setMetrics(metricsSystem.getMetrics());
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: "rgba(0,0,0,0.8)" }}
    >
      <div
        className="w-full max-w-md p-6 rounded-lg"
        style={{
          background: "#0f172a",
          border: "1px solid rgba(0,229,255,0.3)",
        }}
      >
        <h2
          className="font-display font-bold text-2xl mb-6"
          style={{ color: "#00e5ff" }}
        >
          ⚙️ SETTINGS
        </h2>

        {/* Audio Settings */}
        <div className="mb-6">
          <h3
            className="font-hud text-sm font-bold mb-3"
            style={{ color: "#00ff88" }}
          >
            AUDIO
          </h3>

          <div className="space-y-3">
            <div>
              <label
                htmlFor="volume-control"
                className="block font-hud text-xs mb-2"
                style={{ color: "rgba(0,229,255,0.7)" }}
              >
                Volume: {Math.round(audioConfig.volume * 100)}%
              </label>
              <input
                id="volume-control"
                type="range"
                min="0"
                max="100"
                value={Math.round(audioConfig.volume * 100)}
                onChange={(e) =>
                  handleVolumeChange(Number.parseInt(e.target.value) / 100)
                }
                className="w-full"
                style={{ accentColor: "#00e5ff" }}
              />
            </div>

            <button
              type="button"
              onClick={handleToggleMute}
              className="w-full py-2 px-3 font-hud text-xs border rounded transition"
              style={{
                background: audioConfig.muted
                  ? "rgba(255,51,51,0.1)"
                  : "rgba(0,229,255,0.1)",
                borderColor: audioConfig.muted ? "#ff3333" : "#00e5ff",
                color: audioConfig.muted ? "#ff3333" : "#00e5ff",
              }}
            >
              {audioConfig.muted ? "🔇 MUTED" : "🔊 UNMUTED"}
            </button>

            <button
              type="button"
              onClick={handleToggleEffects}
              className="w-full py-2 px-3 font-hud text-xs border rounded transition"
              style={{
                background: audioConfig.effectsEnabled
                  ? "rgba(0,229,255,0.1)"
                  : "rgba(255,170,0,0.1)",
                borderColor: audioConfig.effectsEnabled ? "#00e5ff" : "#ffaa00",
                color: audioConfig.effectsEnabled ? "#00e5ff" : "#ffaa00",
              }}
            >
              {audioConfig.effectsEnabled ? "✓ SFX ON" : "✗ SFX OFF"}
            </button>

            <button
              type="button"
              onClick={handleToggleMusic}
              className="w-full py-2 px-3 font-hud text-xs border rounded transition"
              style={{
                background: audioConfig.musicEnabled
                  ? "rgba(0,229,255,0.1)"
                  : "rgba(255,170,0,0.1)",
                borderColor: audioConfig.musicEnabled ? "#00e5ff" : "#ffaa00",
                color: audioConfig.musicEnabled ? "#00e5ff" : "#ffaa00",
              }}
            >
              {audioConfig.musicEnabled ? "♪ MUSIC ON" : "♪ MUSIC OFF"}
            </button>
          </div>
        </div>

        {/* Game Statistics */}
        <div className="mb-6">
          <h3
            className="font-hud text-sm font-bold mb-3"
            style={{ color: "#00ff88" }}
          >
            STATISTICS
          </h3>

          <div
            className="space-y-2 text-xs font-hud"
            style={{ color: "rgba(0,229,255,0.7)" }}
          >
            <div className="flex justify-between">
              <span>Games Played:</span>
              <span style={{ color: "#00e5ff" }}>{metrics.gamesPlayed}</span>
            </div>
            <div className="flex justify-between">
              <span>Win Rate:</span>
              <span style={{ color: "#00e5ff" }}>
                {metricsSystem.getWinRate().toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>Highest Chapter:</span>
              <span style={{ color: "#00e5ff" }}>{metrics.chapterHighest}</span>
            </div>
            <div className="flex justify-between">
              <span>Average Score:</span>
              <span style={{ color: "#00e5ff" }}>
                {metricsSystem.getAverageScore().toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Avg Session:</span>
              <span style={{ color: "#00e5ff" }}>
                {Math.round(metrics.averageSessionLength)}s
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleResetMetrics}
            className="w-full mt-3 py-2 px-3 font-hud text-xs border rounded transition"
            style={{
              background: "rgba(255,51,51,0.1)",
              borderColor: "#ff3333",
              color: "#ff3333",
            }}
          >
            🔄 RESET STATS
          </button>
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 font-hud font-bold border-2 transition"
          style={{
            borderColor: "#00e5ff",
            color: "#00e5ff",
            background: "rgba(0,229,255,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,229,255,0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,229,255,0.1)";
          }}
        >
          ← BACK
        </button>
      </div>
    </div>
  );
}
