
export interface SimulationParams {
  // Configuración de Población y Consumo
  prevalence: number;
  servingSize: number;
  populationSize: number;
  servingsPerYear: number;
  iterations: number; // Nuevo campo para control de Monte Carlo
  
  // Etapa Inicial
  initialLogMean: number;
  initialLogStd: number;
  
  // Modelo Multietapa (Delta Log)
  processingDeltaLog: number;
  transportDeltaLog: number;
  distributionDeltaLog: number;
  preparationDeltaLog: number;

  // Parámetros Cinéticos (Para Gráficas de la imagen)
  growthRate: number;      // Tasa de crecimiento (Log10/h)
  growthTime: number;      // Tiempo de abuso térmico (h)
  delta: number;           // Parámetro de escala Weibull (min)
  p: number;               // Parámetro de forma Weibull
  inactivationTime: number; // Tiempo de proceso térmico (min)
  
  // Dosis-Respuesta
  alpha: number;
  beta: number;
  
  // Gravedad y Outcome
  illnessProb: number;
  hospRate: number;
  mortalityRate: number;
  absenceDays: number;

  // Parámetros Económicos Personalizables
  costHosp: number;        // Costo por hospitalización
  costAmb: number;         // Costo por atención ambulatoria/consulta
  costAbsence: number;     // Costo por día de ausentismo
  costDeath: number;       // Valor Estadístico de la Vida (VSL)
}

export interface PathogenProfile {
  id: string;
  name: string;
  description: string;
  associatedFoods: string[];
  params: Partial<SimulationParams>;
}

export interface FoodProfile {
  id: string;
  name: string;
  description: string;
  icon: string;
  typicalPathogens: string[];
  defaultServingSize: number;
  defaultPrevalence: number;
}

export interface HistogramBin {
  name: string;
  x: number;
  value: number;
}

export interface Summary {
  infected: number;
  ill: number;
  hospitalized: number;
  deaths: number;
  absence: number;
  annualCases: number;
  individualYearlyRisk: number;
}

export interface StatsData {
  mean: number;
  sd: number;
  p5: number;
  p95: number;
  ciLow: number;
  ciHigh: number;
  median: number;
  mode: number;
  skewness: number;
  kurtosis: number;
}

export interface SimulationResults {
  summary: Summary;
  histogram: HistogramBin[];
  stats: StatsData;
  stageProgression: { name: string; value: number }[];
}

export interface SavedSimulation {
  id: string;
  timestamp: number;
  params: SimulationParams;
  results: SimulationResults & { sensitivity: any[] };
  foodName: string;
  pathogenName: string;
}
