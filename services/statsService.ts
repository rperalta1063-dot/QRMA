
/**
 * Statistical Utilities for Monte Carlo Simulation
 */
export const stats = {
  /**
   * Generates a random number from a Normal distribution using Box-Muller transform.
   */
  normal: (mean: number, std: number): number => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return z * std + mean;
  },

  /**
   * Generates a random number from a Log-Normal distribution.
   */
  logNormal: (meanLog10: number, stdLog10: number): number => {
    const val = stats.normal(meanLog10, stdLog10);
    return Math.pow(10, val);
  },

  /**
   * Simple Beta-Poisson dose-response model calculation.
   */
  betaPoissonInfProb: (dose: number, alpha: number, beta: number): number => {
    if (dose <= 0) return 0;
    return 1 - Math.pow(1 + dose / beta, -alpha);
  }
};
