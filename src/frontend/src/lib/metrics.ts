// Game metrics and telemetry for tracking engagement and performance
// Privacy-first: All data stored locally, no external calls without consent

export interface GameMetrics {
  sessionId: string;
  startTime: number;
  endTime?: number;
  chapterHighest: number;
  totalScore: number;
  gamesPlayed: number;
  gamesWon: number;
  averageSessionLength: number;
  lastPlayedAt: number;
  // Performance metrics
  avgFrameTime: number;
  avgLoadTime: number;
  crashes: number;
}

class MetricsSystem {
  private sessionId: string;
  private startTime: number;
  private metrics: GameMetrics;
  private frameCount = 0;
  private frameTime = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.metrics = this.loadMetrics();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private loadMetrics(): GameMetrics {
    const saved = localStorage.getItem("aegis_metrics");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      sessionId: this.sessionId,
      startTime: this.startTime,
      chapterHighest: 1,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      averageSessionLength: 0,
      lastPlayedAt: this.startTime,
      avgFrameTime: 0,
      avgLoadTime: 0,
      crashes: 0,
    };
  }

  private saveMetrics() {
    localStorage.setItem("aegis_metrics", JSON.stringify(this.metrics));
  }

  // Track game completion
  trackGameEnd(won: boolean, score: number, chapter: number) {
    this.metrics.gamesPlayed++;
    if (won) this.metrics.gamesWon++;
    this.metrics.totalScore += score;
    if (chapter > this.metrics.chapterHighest) {
      this.metrics.chapterHighest = chapter;
    }
    this.metrics.lastPlayedAt = Date.now();
    this.metrics.endTime = Date.now();

    // Calculate average session length
    const sessionLength = (this.metrics.endTime - this.startTime) / 1000; // seconds
    this.metrics.averageSessionLength =
      (this.metrics.averageSessionLength * (this.metrics.gamesPlayed - 1) +
        sessionLength) /
      this.metrics.gamesPlayed;

    this.saveMetrics();
    this.logMetric("game_end", {
      won,
      score,
      chapter,
      sessionLength,
    });
  }

  // Track frame rendering performance
  trackFrameTime(deltaTime: number) {
    this.frameCount++;
    this.frameTime += deltaTime;

    // Update average every 60 frames (1 second at 60fps)
    if (this.frameCount >= 60) {
      this.metrics.avgFrameTime = this.frameTime / this.frameCount;
      this.frameCount = 0;
      this.frameTime = 0;
    }
  }

  // Track page load time
  trackLoadTime(loadTime: number) {
    this.metrics.avgLoadTime = (this.metrics.avgLoadTime + loadTime) / 2;
  }

  // Track crash/error
  trackCrash(error: Error) {
    this.metrics.crashes++;
    this.saveMetrics();
    this.logMetric("crash", {
      message: error.message,
      stack: error.stack,
    });
  }

  // Generic metric logging
  private logMetric(eventName: string, data?: any) {
    const logEntry = {
      timestamp: Date.now(),
      sessionId: this.sessionId,
      event: eventName,
      data,
    };
    console.debug("[METRICS]", logEntry);

    // Store in browser's indexedDB for later analysis if needed
    // For now, just log to console in development
  }

  // Get all metrics
  getMetrics(): GameMetrics {
    return { ...this.metrics };
  }

  // Reset metrics (for testing)
  reset() {
    localStorage.removeItem("aegis_metrics");
    this.metrics = {
      sessionId: this.sessionId,
      startTime: this.startTime,
      chapterHighest: 1,
      totalScore: 0,
      gamesPlayed: 0,
      gamesWon: 0,
      averageSessionLength: 0,
      lastPlayedAt: this.startTime,
      avgFrameTime: 0,
      avgLoadTime: 0,
      crashes: 0,
    };
  }

  // Calculate win rate
  getWinRate(): number {
    if (this.metrics.gamesPlayed === 0) return 0;
    return (this.metrics.gamesWon / this.metrics.gamesPlayed) * 100;
  }

  // Get average score
  getAverageScore(): number {
    if (this.metrics.gamesPlayed === 0) return 0;
    return this.metrics.totalScore / this.metrics.gamesPlayed;
  }
}

// Singleton instance
export const metricsSystem = new MetricsSystem();
