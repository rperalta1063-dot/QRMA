
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
  },

  /**
   * Exponential dose-response model.
   */
  exponentialInfProb: (dose: number, k: number): number => {
    if (dose <= 0) return 0;
    return 1 - Math.exp(-k * dose);
  },

  /**
   * Log-Logistic dose-response model.
   */
  logLogisticInfProb: (dose: number, d50: number, beta: number): number => {
    if (dose <= 0) return 0;
    return 1 / (1 + Math.pow(dose / d50, -beta));
  },

  /**
   * Log-Normal dose-response model.
   */
  logNormalInfProb: (dose: number, d50: number, sigma: number): number => {
    if (dose <= 0) return 0;
    const logDose = Math.log10(dose);
    const logD50 = Math.log10(d50);
    // Standard normal CDF approximation
    const x = (logDose - logD50) / sigma;
    return 0.5 * (1 + stats.erf(x / Math.sqrt(2)));
  },

  /**
   * Error function approximation.
   */
  erf: (x: number): number => {
    const a1 = 0.254829592;
    const a2 = -0.284496736;
    const a3 = 1.421413741;
    const a4 = -1.453152027;
    const a5 = 1.061405429;
    const p = 0.3275911;
    const sign = x < 0 ? -1 : 1;
    const absX = Math.abs(x);
    const t = 1.0 / (1.0 + p * absX);
    const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
    return sign * y;
  }
};
