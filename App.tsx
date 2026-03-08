
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, LineChart, Line, BarChart, Bar, Cell, ReferenceLine
} from 'recharts';
import { 
  Activity, Play, RefreshCcw, BarChart3, 
  HelpCircle, Moon, Sun, Sigma, Clock, Flame, DollarSign, Info, ShoppingBag, UtensilsCrossed, Factory, Users, TrendingUp,
  Trash2, FileDown, ShieldAlert, HeartPulse, Scale, Share2, Check, X, Zap, AlertCircle, Banknote, Microscope as MicroscopeIcon, Calculator
} from 'lucide-react';
import { SimulationParams, SimulationResults, PathogenProfile, FoodProfile, SavedSimulation, DoseResponseModel } from './types';
import { stats } from './services/statsService';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

type Language = 'es' | 'en' | 'fr';

const TRANSLATIONS = {
  es: {
    title: "ProbRisk QMRA",
    subtitle: "Evaluación Avanzada de Impacto y Monte Carlo",
    runBtn: "Ejecutar Monte Carlo",
    simulating: "Simulando...",
    baseConfig: "Configuración Base",
    foodLabel: "Alimento",
    pathogenLabel: "Patógeno",
    pathogenInfo: "Información del Patógeno",
    foodProfile: "Perfil del Alimento",
    exposedPop: "Pob. Expuesta",
    servingsYear: "Raciones/Año",
    iterations: "Simulaciones (Monte Carlo)",
    exposureStages: "Etapas de Exposición",
    prevalence: "Prevalencia",
    initialLoad: "Carga Ini (Log)",
    logChanges: "Cambios Logarítmicos (Δ Log)",
    process: "Proceso",
    transport: "Transporte",
    retail: "Retail",
    prep: "Preparación",
    kinetics: "Cinética de Crecimiento",
    growthRate: "Tasa (Log/h)",
    growthTime: "Tiempo (h)",
    inactivationTitle: "Cinética de Inactivación (Weibull)",
    inactivationDetailTitle: "DETALLES DE CÁLCULO WEIBULL",
    inactivationSummary: "Resumen de Reducción Térmica",
    totalReduction: "Reducción Total Log10",
    formulaTitle: "Modelo Matemático",
    doseResponseTitle: "CURVA DOSIS-RESPUESTA",
    doseResponseModel: "Modelo Dosis-Respuesta",
    exponential: "Exponencial",
    betaPoisson: "Beta-Poisson (Aprox)",
    logLogistic: "Log-Logístico",
    logNormal: "Log-Normal",
    kLabel: "Parámetro k",
    d50Label: "Dosis Media (D50)",
    drSigmaLabel: "Sigma (Log-Normal)",
    doseLabel: "Dosis (CFU)",
    probIllnessLabel: "Prob. Enfermedad",
    econParamsTitle: "Parámetros Económicos (USD)",
    costHospLabel: "Costo Hosp.",
    costAmbLabel: "Costo Consulta",
    costAbsenceLabel: "Costo Día Lab.",
    costDeathLabel: "Valor Vida (VSL)",
    emptyResults: "Resultados de Simulación Vacíos",
    emptySub: "Ajuste los parámetros y presione 'Ejecutar Monte Carlo'.",
    share: "Compartir",
    clear: "Limpiar",
    pdf: "Reporte PDF",
    infections: "INFECCIONES",
    severe: "GRAVES",
    deaths: "MUERTES",
    absence: "AUSENTISMO",
    fatalityRate: "LETALIDAD",
    stdDev: "Desv. Est.",
    avgEst: "Estimado Promedio",
    medCare: "Atención Médica",
    lethality: "Letalidad Poblacional",
    productivity: "Días de Productividad Perdidos",
    caseDist: "DISTRIBUCIÓN DE CASOS",
    statsProfile: "Perfil Estadístico Detallado",
    econTitle: "Evaluación de Carga Económica Anual (USD)",
    sanitaryCosts: "COSTOS SANITARIOS",
    prodCosts: "COSTO PRODUCTIVIDAD",
    socialImpact: "IMPACTO SOCIAL TOTAL",
    progressionTitle: "EVOLUCIÓN DE CARGA LOGARÍTMICA",
    inactivationProfile: "PERFIL DE INACTIVACIÓN (WEIBULL)",
    sensitivityTitle: "ANÁLISIS DE SENSIBILIDAD (TORNADO)",
    linkCopied: "Enlace Copiado",
    mean: "Media",
    median: "Mediana",
    mode: "Moda (Bin)",
    sd: "Desv. Est.",
    skew: "Asimetría",
    kurt: "Curtosis",
    timeApplied: "T. Aplicado",
    timeMin: "Tiempo (min)",
    reductionLog: "Reducción (Log)",
    intermediateValue: "(t/δ)ᵖ",
    socialImpactDesc: "Suma de costos directos (salud) e indirectos (productividad).",
    sanitaryDesc: "Carga por hospitalización y consultas.",
    prodDesc: "Ausentismo laboral y pérdida de productividad.",
    about: "Acerca de",
    aboutTitle: "Sobre ProbRisk QMRA",
    aboutDescription: "ProbRisk es una herramienta de Evaluación Cuantitativa de Riesgos Microbiológicos (QMRA) diseñada para estimar el impacto en la salud pública de patógenos transmitidos por alimentos.",
    methodologyTitle: "Metodología de Monte Carlo",
    methodologyDescription: "ProbRisk utiliza simulaciones de Monte Carlo para abordar la complejidad de los sistemas biológicos. En lugar de usar valores fijos, asignamos distribuciones de probabilidad a cada parámetro (incertidumbre y variabilidad). El motor de simulación ejecuta miles de iteraciones independientes; en cada una, se extrae un valor aleatorio de las distribuciones definidas. Este proceso permite capturar escenarios extremos (brotes masivos) que un cálculo promedio ignoraría, proporcionando una visión probabilística del riesgo real.",
    guideTitle: "Guía de Configuración",
    guideStep1: "1. Selección de Perfil: Elija el alimento y patógeno. Esto carga automáticamente el modelo dosis-respuesta (Beta-Poisson) y los parámetros económicos por defecto.",
    guideStep2: "2. Dinámica de la Cadena: Configure los cambios logarítmicos (Δ Log). Un valor de -2.0 en procesamiento indica una reducción de 100 veces en la carga bacteriana. Los valores positivos representan crecimiento por abuso térmico o fallos de higiene.",
    guideStep3: "3. Cinética Avanzada: Defina la tasa de crecimiento (Log/h) y el tiempo de exposición. Para la inactivación, el modelo Weibull (Delta y P) permite modelar curvas no lineales, capturando la resistencia de subpoblaciones bacterianas.",
    guideStep4: "4. Simulación: Al presionar 'Ejecutar', el sistema realiza miles de cálculos de dosis ingerida y probabilidad de infección individual para cada ración consumida en la población.",
    guideStep5: "5. Análisis de Resultados: Evalúe no solo la media, sino la dispersión de los datos. Un riesgo alto con baja frecuencia puede ser tan crítico como un riesgo moderado constante.",
    interpretationTitle: "Interpretación de Resultados",
    interpretationDesc: "La interpretación debe centrarse en tres ejes: 1. Distribución de Casos: El histograma muestra la frecuencia de diferentes tamaños de brotes; una cola larga a la derecha indica riesgo de eventos masivos. 2. Impacto Social: Traduce el daño a la salud en términos monetarios, facilitando la toma de decisiones costo-beneficio. 3. Sensibilidad: Identifica qué parámetro (ej. temperatura de retail) tiene mayor peso en el resultado final, señalando dónde invertir en medidas de control.",
    walkthroughTitle: "Walkthrough de Parámetros Complejos",
    walkthroughProcessing: "Procesamiento (Δ Log): Representa la eficacia de las medidas de control industrial. Un valor negativo alto es el objetivo de cualquier plan HACCP.",
    walkthroughKinetics: "Cinética de Crecimiento: Crucial en productos listos para el consumo. Pequeños cambios en la tasa de crecimiento pueden resultar en dosis infectivas masivas debido a la naturaleza exponencial de las bacterias.",
    walkthroughWeibull: "Modelo Weibull: El parámetro 'Delta' es el tiempo para la primera reducción logarítmica. 'P' define la curvatura: P < 1 indica subpoblaciones resistentes (curva cóncava), P > 1 indica daño acumulativo (curva convexa).",
    sectionHelp: "Guía de Sección",
    sectionHelpBase: "Seleccione el alimento y el patógeno. La población expuesta y las raciones por año determinan la escala del impacto total.",
    sectionHelpEcon: "Defina los costos asociados a la enfermedad. Estos valores se utilizan para calcular el impacto social total en términos monetarios.",
    sectionHelpExposure: "Ajuste cómo cambia la carga bacteriana a través de la cadena. Los cambios logarítmicos y la cinética determinan la dosis final ingerida.",
    interpretationGuide: "Guía de Interpretación",
    riskLevel: "Nivel de Riesgo",
    lowRisk: "Bajo",
    medRisk: "Moderado",
    highRisk: "Alto",
    insightTitle: "Análisis de Impacto",
    insightDesc: "Basado en los resultados, el impacto social se concentra principalmente en {focus}. Se recomienda priorizar la etapa de {stage} para reducir el riesgo.",
    saveRun: "Guardar Simulación",
    comparisonTitle: "Comparativa de Escenarios",
    compareBtn: "Comparar",
    compareSelected: "Comparar Seleccionados",
    diffLabel: "Diferencia",
    paramImpact: "Impacto de Parámetros",
    riskSummary: "Resumen de Riesgo",
    savedRuns: "Simulaciones Guardadas",
    noSavedRuns: "No hay simulaciones guardadas.",
    clearSaved: "Limpiar Historial",
    compareInfections: "Infecciones (Media)",
    compareSocialImpact: "Impacto Social (USD)",
    compareDeaths: "Muertes (Media)",
    scenario: "Escenario",
    remove: "Eliminar",
    load: "Cargar",
    versionLabel: "Versión",
    developersLabel: "Desarrolladores",
    developersContent: "ProbRisk Team / High-Resolution Analytics",
    close: "Cerrar",
    hospRateLabel: "Tasa Hospitalización",
    mortalityRateLabel: "Tasa Mortalidad",
    absenceDaysLabel: "Días Ausentismo",
    p95: "Percentil 95",
    impactPercent: "% de Impacto en Riesgo",
    countLabel: "Frecuencia",
    logLoadLabel: "Carga (Log10)",
    modelInsightTitle: "Perspectiva del Modelo",
    modelInsightDesc: "El modelo Beta-Poisson considera la probabilidad de que una sola célula inicie la infección, teniendo en cuenta la variabilidad entre el huésped y el patógeno.",
    errorRequired: "Requerido",
    errorRange: "Rango: {min} - {max}",
    tooltips: {
      inf: "Total de personas que ingieren el patógeno y desarrollan una colonización o infección clínica.",
      sev: "Casos que requieren hospitalización o cuidados médicos intensivos según la tasa definida.",
      dead: "Estimación de fallecimientos basados en la tasa de mortalidad y el número de casos.",
      abs: "Días totales de trabajo perdidos por la población afectada, incluyendo convalecencia.",
      fatality: "Porcentaje de fallecimientos en relación al total de personas infectadas.",
      pop: "Población total susceptible de consumir el producto en el periodo evaluado.",
      serv: "Frecuencia de consumo individual estimada por año.",
      iter: "Número de veces que se repite la simulación para capturar la variabilidad estadística.",
      prev: "Probabilidad de que una unidad de alimento esté contaminada al inicio.",
      load: "Concentración bacteriana inicial en unidades logarítmicas (UFC/g).",
      econHosp: "Costo directo anual por hospitalizaciones y tratamientos médicos.",
      econProd: "Costo indirecto por la pérdida de días laborables y productividad.",
      econSocial: "Impacto social total: Salud + Productividad + Valor de Vida (VPM).",
      prog: "Cambio promedio de la carga bacteriana a través de las etapas de la cadena.",
      inact: "Curva de reducción logarítmica esperada bajo los parámetros térmicos de Weibull.",
      sensitivity: "Muestra cómo varía el riesgo total al modificar un parámetro individualmente. Ayuda a identificar puntos críticos de control.",
      costHosp: "Costo promedio de un evento de hospitalización por esta enfermedad.",
      costAmb: "Costo de consulta médica o tratamiento ambulatorio.",
      costAbsence: "Pérdida económica diaria por incapacidad laboral.",
      costDeath: "Valor estadístico asignado a la prevención de una fatalidad (VSL).",
      doseResponse: "Visualiza la probabilidad de enfermar en función de la cantidad de microorganismos ingeridos, según el modelo Beta-Poisson del patógeno seleccionado.",
      alpha: "Parámetro de forma (α) del modelo Beta-Poisson. Representa la infectividad intrínseca del patógeno.",
      beta: "Parámetro de escala (β). Representa la resistencia o tolerancia del sistema inmunológico del huésped.",
      weibullDetail: "Detalla la progresión de la muerte térmica bacteriana basada en la asimetría de la curva de supervivencia.",
      processing: "Reducción o crecimiento durante el procesamiento industrial.",
      transport: "Cambios en la carga bacteriana durante el transporte.",
      retail: "Cambios durante la distribución y venta al por menor.",
      prep: "Reducción por preparación o cocción en el hogar.",
      growthRate: "Velocidad de crecimiento del patógeno (Log10/h).",
      growthTime: "Duración del tiempo de abuso térmico o almacenamiento.",
      delta: "Tiempo necesario para la primera reducción logarítmica.",
      p: "Parámetro de forma de la curva de inactivación.",
      k: "Parámetro de tasa del modelo exponencial.",
      d50: "Dosis que produce una probabilidad de infección del 50%.",
      drSigma: "Desviación estándar del logaritmo de la dosis en el modelo Log-Normal."
    }
  },
  en: {
    title: "ProbRisk QMRA",
    subtitle: "Advanced Impact Assessment & Monte Carlo",
    runBtn: "Run Monte Carlo",
    simulating: "Simulating...",
    baseConfig: "Base Configuration",
    foodLabel: "Food",
    pathogenLabel: "Pathogen",
    pathogenInfo: "Pathogen Information",
    foodProfile: "Food Profile",
    exposedPop: "Exposed Pop.",
    servingsYear: "Servings/Year",
    iterations: "Simulations (Monte Carlo)",
    exposureStages: "Exposure Stages",
    prevalence: "Prevalence",
    initialLoad: "Initial Load (Log)",
    logChanges: "Logarithmic Changes (Δ Log)",
    process: "Processing",
    transport: "Transport",
    retail: "Retail",
    prep: "Preparation",
    kinetics: "Growth Kinetics",
    growthRate: "Rate (Log/h)",
    growthTime: "Time (h)",
    inactivationTitle: "Inactivation Kinetics (Weibull)",
    inactivationDetailTitle: "WEIBULL CALCULATION DETAILS",
    inactivationSummary: "Thermal Reduction Summary",
    totalReduction: "Total Reduction Log10",
    formulaTitle: "Mathematical Model",
    doseResponseTitle: "DOSE-RESPONSE CURVE",
    doseResponseModel: "Dose-Response Model",
    exponential: "Exponential",
    betaPoisson: "Beta-Poisson (Approx)",
    logLogistic: "Log-Logistic",
    logNormal: "Log-Normal",
    kLabel: "k Parameter",
    d50Label: "Median Dose (D50)",
    drSigmaLabel: "Sigma (Log-Normal)",
    doseLabel: "Dose (CFU)",
    probIllnessLabel: "Prob. of Illness",
    econParamsTitle: "Economic Parameters (USD)",
    costHospLabel: "Hosp. Cost",
    costAmbLabel: "Consult Cost",
    costAbsenceLabel: "Work Day Cost",
    costDeathLabel: "Life Value (VSL)",
    emptyResults: "Empty Simulation Results",
    emptySub: "Adjust parameters and press 'Run Monte Carlo'.",
    share: "Share",
    clear: "Clear",
    pdf: "PDF Report",
    infections: "INFECTIONS",
    severe: "SEVERE",
    deaths: "DEATHS",
    absence: "ABSENTEEISM",
    fatalityRate: "FATALITY RATE",
    stdDev: "Std Dev",
    avgEst: "Average Estimate",
    medCare: "Medical Care",
    lethality: "Population Lethality",
    productivity: "Lost Productivity Days",
    caseDist: "CASE DISTRIBUTION",
    statsProfile: "Detailed Statistical Profile",
    econTitle: "Annual Economic Burden Assessment (USD)",
    sanitaryCosts: "SANITARY COSTS",
    prodCosts: "PRODUCTIVITY COST",
    socialImpact: "TOTAL SOCIAL IMPACT",
    progressionTitle: "LOGARITHMIC LOAD EVOLUTION",
    inactivationProfile: "INACTIVATION PROFILE (WEIBULL)",
    sensitivityTitle: "SENSITIVITY ANALYSIS (TORNADO)",
    linkCopied: "Link Copied",
    mean: "Mean",
    median: "Median",
    mode: "Mode (Bin)",
    sd: "Std. Dev.",
    skew: "Skewness",
    kurt: "Kurtosis",
    timeApplied: "T. Applied",
    timeMin: "Time (min)",
    reductionLog: "Reduction (Log)",
    intermediateValue: "(t/δ)ᵖ",
    socialImpactDesc: "Sum of direct (health) and indirect (productivity) costs.",
    sanitaryDesc: "Burden from hospitalizations and consultations.",
    prodDesc: "Work absenteeism and lost labor productivity.",
    about: "About",
    aboutTitle: "About ProbRisk QMRA",
    aboutDescription: "ProbRisk is a Quantitative Microbiological Risk Assessment (QMRA) tool designed to estimate the public health impact of foodborne pathogens.",
    methodologyTitle: "Monte Carlo Methodology",
    methodologyDescription: "ProbRisk employs Monte Carlo simulations to address the inherent complexity of biological systems. Instead of using point estimates, we assign probability distributions to each parameter to account for uncertainty and variability. The engine runs thousands of independent iterations; in each, a random value is drawn from the defined distributions. This process captures extreme scenarios (mass outbreaks) that a simple average would miss, providing a robust probabilistic view of real-world risk.",
    guideTitle: "Setup Guide",
    guideStep1: "1. Profile Selection: Choose your food and pathogen. This automatically loads the specific dose-response model (Beta-Poisson) and default economic parameters.",
    guideStep2: "2. Chain Dynamics: Configure logarithmic changes (Δ Log). A value of -2.0 in processing indicates a 100-fold reduction in bacterial load. Positive values represent growth due to thermal abuse or hygiene failures.",
    guideStep3: "3. Advanced Kinetics: Define the growth rate (Log/h) and exposure time. For inactivation, the Weibull model (Delta and P) allows for non-linear survival curves, capturing the resistance of bacterial subpopulations.",
    guideStep4: "4. Simulation: Upon clicking 'Run', the system performs thousands of individual dose calculations and infection probability assessments for every serving consumed by the population.",
    guideStep5: "5. Results Analysis: Evaluate not just the mean, but the data dispersion. A high-impact low-frequency risk can be just as critical as a constant moderate risk.",
    interpretationTitle: "Interpreting Results",
    interpretationDesc: "Interpretation should focus on three pillars: 1. Case Distribution: The histogram shows the frequency of different outbreak sizes; a long right tail indicates the risk of massive events. 2. Social Impact: Translates health damage into monetary terms, facilitating cost-benefit decision-making. 3. Sensitivity: Identifies which parameter (e.g., retail temperature) has the most weight on the final result, highlighting where to prioritize control measures.",
    walkthroughTitle: "Complex Parameters Walkthrough",
    walkthroughProcessing: "Processing (Δ Log): Represents the efficacy of industrial control measures. A high negative value is the goal of any robust HACCP plan.",
    walkthroughKinetics: "Growth Kinetics: Crucial for ready-to-eat products. Small changes in growth rate can lead to massive infective doses due to the exponential nature of bacterial multiplication.",
    walkthroughWeibull: "Weibull Model: The 'Delta' parameter is the time for the first log-reduction. 'P' defines the curvature: P < 1 indicates resistant subpopulations (concave), P > 1 indicates cumulative damage (convex).",
    sectionHelp: "Section Guide",
    sectionHelpBase: "Select the food and pathogen. The exposed population and servings per year determine the scale of the total impact.",
    sectionHelpEcon: "Define the costs associated with the illness. These values are used to calculate the total social impact in monetary terms.",
    sectionHelpExposure: "Adjust how the bacterial load changes through the chain. Logarithmic changes and kinetics determine the final ingested dose.",
    interpretationGuide: "Interpretation Guide",
    riskLevel: "Risk Level",
    lowRisk: "Low",
    medRisk: "Moderate",
    highRisk: "High",
    insightTitle: "Impact Analysis",
    insightDesc: "Based on the results, the social impact is primarily concentrated in {focus}. It is recommended to prioritize the {stage} stage to reduce risk.",
    saveRun: "Save Simulation",
    comparisonTitle: "Scenario Comparison",
    compareBtn: "Compare",
    compareSelected: "Compare Selected",
    diffLabel: "Difference",
    paramImpact: "Parameter Impact",
    riskSummary: "Risk Summary",
    savedRuns: "Saved Simulations",
    noSavedRuns: "No saved simulations yet.",
    clearSaved: "Clear History",
    compareInfections: "Infections (Mean)",
    compareSocialImpact: "Social Impact (USD)",
    compareDeaths: "Deaths (Mean)",
    scenario: "Scenario",
    remove: "Remove",
    load: "Load",
    versionLabel: "Version",
    developersLabel: "Developers",
    developersContent: "ProbRisk Team / High-Resolution Analytics",
    close: "Close",
    hospRateLabel: "Hosp. Rate",
    mortalityRateLabel: "Mortality Rate",
    absenceDaysLabel: "Absentee Days",
    p95: "95th Percentile",
    impactPercent: "% Impact on Risk",
    countLabel: "Frequency",
    logLoadLabel: "Load (Log10)",
    modelInsightTitle: "Model Insight",
    modelInsightDesc: "The Beta-Poisson model accounts for the probability of a single cell initiating infection, considering host-pathogen variability.",
    errorRequired: "Required",
    errorRange: "Range: {min} - {max}",
    tooltips: {
      inf: "Total number of people who ingest the pathogen and develop a clinical infection.",
      sev: "Cases requiring hospitalization or intensive medical care based on the defined rate.",
      dead: "Estimated deaths based on mortality rate and total case count.",
      abs: "Total work days lost by the affected population, including recovery time.",
      fatality: "Percentage of deaths relative to the total number of infections.",
      pop: "Total population susceptible to consuming the product in the evaluated period.",
      serv: "Estimated individual consumption frequency per year.",
      iter: "Number of simulation loops to capture statistical variability.",
      prev: "Probability of a food unit being contaminated at the start.",
      load: "Initial bacterial concentration in logarithmic units (CFU/g).",
      econHosp: "Annual direct cost for hospitalizations and medical treatments.",
      econProd: "Indirect cost from lost work days and productivity.",
      econSocial: "Total social impact: Health + Productivity + Value of Life.",
      prog: "Average change in bacterial load across the supply chain stages.",
      inact: "Expected log-reduction curve under Weibull thermal parameters.",
      sensitivity: "Shows how the total risk varies by modifying a single parameter. Helps identify critical control points.",
      costHosp: "Average cost of a hospitalization event.",
      costAmb: "Cost of an outpatient consultation or treatment.",
      costAbsence: "Daily economic loss due to work inability.",
      costDeath: "Statistical value assigned to fatality prevention (VSL).",
      doseResponse: "Visualizes the probability of developing illness based on the amount of ingested organisms, according to the Beta-Poisson model.",
      alpha: "Shape parameter (α). Represents the probability of one cell initiating an infection.",
      beta: "Scale parameter (β). Inversely proportional to the probability of infection.",
      weibullDetail: "Details the thermal death progression based on the asymmetry of the survival curve.",
      processing: "Reduction or growth during industrial processing.",
      transport: "Changes in bacterial load during transport.",
      retail: "Changes during distribution and retail sale.",
      prep: "Reduction due to home preparation or cooking.",
      growthRate: "Pathogen growth velocity (Log10/h).",
      growthTime: "Duration of thermal abuse or storage time.",
      delta: "Time required for the first log-reduction.",
      p: "Shape parameter of the inactivation curve.",
      k: "Rate parameter for the exponential model.",
      d50: "Dose that results in a 50% probability of infection.",
      drSigma: "Standard deviation of the log-dose in the Log-Normal model."
    }
  },
  fr: {
    title: "ProbRisk QMRA",
    subtitle: "Évaluation d'Impact Avancée & Monte Carlo",
    runBtn: "Lancer Monte Carlo",
    simulating: "Simulation...",
    baseConfig: "Configuration de Base",
    foodLabel: "Aliment",
    pathogenLabel: "Pathogène",
    pathogenInfo: "Informations Pathogène",
    foodProfile: "Profil Alimentaire",
    exposedPop: "Pop. Exposée",
    servingsYear: "Portions/An",
    iterations: "Simulations (Monte Carlo)",
    exposureStages: "Étapes d'Exposition",
    prevalence: "Prévalence",
    initialLoad: "Charge Init (Log)",
    logChanges: "Changements Log (Δ Log)",
    process: "Processus",
    transport: "Transport",
    retail: "Vente",
    prep: "Préparation",
    kinetics: "Cinétique de Croissance",
    growthRate: "Taux (Log/h)",
    growthTime: "Temps (h)",
    inactivationTitle: "Cinétique d'Inactivation (Weibull)",
    inactivationDetailTitle: "DÉTAILS DU CALCUL WEIBULL",
    inactivationSummary: "Résumé de la Réduction Thermique",
    totalReduction: "Réduction Totale Log10",
    formulaTitle: "Modèle Mathématique",
    doseResponseTitle: "COURBE DOSE-RÉPONSE",
    doseResponseModel: "Modèle Dose-Réponse",
    exponential: "Exponentiel",
    betaPoisson: "Bêta-Poisson (Approx)",
    logLogistic: "Log-Logistique",
    logNormal: "Log-Normal",
    kLabel: "Paramètre k",
    d50Label: "Dose Médiane (D50)",
    drSigmaLabel: "Sigma (Log-Normal)",
    doseLabel: "Dose (UFC)",
    probIllnessLabel: "Prob. Maladie",
    econParamsTitle: "Paramètres Économiques (USD)",
    costHospLabel: "Coût Hosp.",
    costAmbLabel: "Coût Consult.",
    costAbsenceLabel: "Coût Journée Lab.",
    costDeathLabel: "Valeur Vie (VSL)",
    emptyResults: "Résultats de Simulation Vides",
    emptySub: "Ajustez les paramètres et cliquez sur 'Lancer Monte Carlo'.",
    share: "Partager",
    clear: "Effacer",
    pdf: "Rapport PDF",
    infections: "INFECTIONS",
    severe: "GRAVES",
    deaths: "DÉCÈS",
    absence: "ABSENTÉISME",
    fatalityRate: "LÉTALITÉ",
    stdDev: "Écart Type",
    avgEst: "Estimation Moyenne",
    medCare: "Soins Médicaux",
    lethality: "Létalité Populationnelle",
    productivity: "Jours de Productivité Perdus",
    caseDist: "DISTRIBUCIÓN DES CAS",
    statsProfile: "Profil Statistique Détaillé",
    econTitle: "Évaluation de la Charge Économique Annuelle (USD)",
    sanitaryCosts: "COÛTS SANITAIRES",
    prodCosts: "COÛT PRODUCTIVITÉ",
    socialImpact: "IMPACT SOCIAL TOTAL",
    progressionTitle: "ÉVOLUTION DE LA CHARGE LOG",
    inactivationProfile: "PROFIL D'INACTIVATION (WEIBULL)",
    sensitivityTitle: "ANALYSE DE SENSIBILITÉ (TORNADE)",
    linkCopied: "Lien Copié",
    mean: "Moyenne",
    median: "Médiane",
    mode: "Mode (Bin)",
    sd: "Écart Type",
    skew: "Asymétrie",
    kurt: "Kurtosis",
    timeApplied: "T. Appliqué",
    timeMin: "Temps (min)",
    reductionLog: "Réduction (Log)",
    intermediateValue: "(t/δ)ᵖ",
    socialImpactDesc: "Somme des coûts directs (santé) et indirects (productivité).",
    sanitaryDesc: "Charge liée aux hospitalisations et consultations.",
    prodDesc: "Absentéisme au travail et perte de productivité.",
    about: "À Propos",
    aboutTitle: "À Propos de ProbRisk QMRA",
    aboutDescription: "ProbRisk est un outil d'Évaluation Quantitative des Risques Microbiologiques (QMRA) conçu pour estimer l'impact sur la santé publique des agents pathogènes d'origine alimentaire.",
    methodologyTitle: "Méthodologie de Monte Carlo",
    methodologyDescription: "ProbRisk utilise des simulations de Monte Carlo pour aborder la complexité des systèmes biologiques. Au lieu de valeurs fixes, nous assignons des distributions de probabilité à chaque paramètre (incertitude et variabilité). Le moteur exécute des milliers d'itérations indépendantes ; dans chacune, une valeur aléatoire est tirée des distributions. Ce processus permet de capturer des scénarios extrêmes (foyers massifs) qu'un calcul moyen ignorerait, offrant une vision probabiliste du risque réel.",
    guideTitle: "Guide de Configuration",
    guideStep1: "1. Sélection du Profil : Choisissez l'aliment et le pathogène. Cela charge automatiquement le modèle dose-réponse (Beta-Poisson) et les paramètres économiques par défaut.",
    guideStep2: "2. Dynamique de la Chaîne : Configurez les changements logarithmiques (Δ Log). Une valeur de -2.0 en traitement indique une réduction au centième de la charge bactérienne. Les valeurs positives représentent la croissance.",
    guideStep3: "3. Cinétique Avancée : Définissez le taux de croissance (Log/h) et le temps d'exposition. Pour l'inactivation, le modèle Weibull (Delta et P) permet de modéliser des courbes non linéaires.",
    guideStep4: "4. Simulation : En cliquant sur 'Lancer', le système effectue des milliers de calculs de doses ingérées et de probabilités d'infection pour chaque portion consommée.",
    guideStep5: "5. Analyse des Résultats : Évaluez non seulement la moyenne, mais aussi la dispersion des données. Un risque rare mais massif peut être aussi critique qu'un risque modéré constant.",
    interpretationTitle: "Interprétation des Résultats",
    interpretationDesc: "L'interprétation doit se concentrer sur trois axes : 1. Distribution des Cas : L'histogramme montre la fréquence des différentes tailles de foyers ; une queue longue à droite indique un risque d'événements massifs. 2. Impact Social : Traduit les dommages sanitaires en termes monétaires pour faciliter les décisions coût-bénéfice. 3. Sensibilité : Identifie quel paramètre a le plus de poids sur le résultat final.",
    walkthroughTitle: "Walkthrough des Paramètres Complexes",
    walkthroughProcessing: "Traitement (Δ Log) : Représente l'efficacité des mesures de contrôle industriel. Une valeur négative élevée est l'objectif de tout plan HACCP.",
    walkthroughKinetics: "Cinétique de Croissance : Cruciale pour les produits prêts à consommer. De petits changements de taux peuvent entraîner des doses infectieuses massives.",
    walkthroughWeibull: "Modèle Weibull : Le paramètre 'Delta' est le temps pour la première réduction log. 'P' définit la courbure : P < 1 indique des sous-populations résistantes, P > 1 indique un dommage cumulatif.",
    sectionHelp: "Guide de Section",
    sectionHelpBase: "Sélectionnez l'aliment et le pathogène. La population exposée et les portions par an déterminent l'ampleur de l'impact total.",
    sectionHelpEcon: "Définissez les coûts associés à la maladie. Ces valeurs sont utilisées pour calculer l'impact social total en termes monétaires.",
    sectionHelpExposure: "Ajustez l'évolution de la charge bactérienne. Les variations logarithmiques et la cinétique déterminent la dose finale ingérée.",
    interpretationGuide: "Guide d'Interprétation",
    riskLevel: "Niveau de Risque",
    lowRisk: "Faible",
    medRisk: "Modéré",
    highRisk: "Élevé",
    insightTitle: "Analyse d'Impact",
    insightDesc: "D'après les résultats, l'impact social se concentre principalement sur {focus}. Il est recommandé de prioriser l'étape {stage} pour réduire le risque.",
    saveRun: "Sauvegarder Simulation",
    comparisonTitle: "Comparaison de Scénarios",
    compareBtn: "Comparer",
    compareSelected: "Comparer la sélection",
    diffLabel: "Différence",
    paramImpact: "Impact des paramètres",
    riskSummary: "Résumé des risques",
    savedRuns: "Simulations Sauvegardées",
    noSavedRuns: "Aucune simulation sauvegardée.",
    clearSaved: "Effacer l'Historique",
    compareInfections: "Infections (Moyenne)",
    compareSocialImpact: "Impact Social (USD)",
    compareDeaths: "Décès (Moyenne)",
    scenario: "Scénario",
    remove: "Supprimer",
    load: "Charger",
    versionLabel: "Version",
    developersLabel: "Développeurs",
    developersContent: "ProbRisk Team / High-Resolution Analytics",
    close: "Fermer",
    hospRateLabel: "Taux Hosp.",
    mortalityRateLabel: "Taux Mortalité",
    absenceDaysLabel: "Jours d'Absence",
    p95: "95e Percentile",
    impactPercent: "% d'Impact sur le Risque",
    countLabel: "Fréquence",
    logLoadLabel: "Charge (Log10)",
    modelInsightTitle: "Aperçu du Modèle",
    modelInsightDesc: "Le modèle Beta-Poisson prend en compte la probabilité qu'une seule cellule déclenche une infection, en considérant la variabilité hôte-pathogène.",
    errorRequired: "Obligatoire",
    errorRange: "Plage: {min} - {max}",
    tooltips: {
      inf: "Nombre total de personnes qui ingèrent le pathogène et développent une infection.",
      sev: "Cas nécessitant une hospitalisation ou des soins intensifs.",
      dead: "Décès estimés basés sur le taux de mortalité.",
      abs: "Nombre total de jours de travail perdus par la population affectée.",
      fatality: "Pourcentage de décès par rapport au nombre total d'infections.",
      pop: "Population totale susceptible de consommer le produit.",
      serv: "Fréquence de consommation individuelle estimée par an.",
      iter: "Nombre de boucles de simulation pour capturer la variabilité.",
      prev: "Probabilité qu'une unité d'aliment soit contaminée au départ.",
      load: "Concentration bactérienne initiale en unités logarithmiques.",
      econHosp: "Coût annuel direct pour les hospitalisations et traitements.",
      econProd: "Coût indirect lié aux jours de travail perdus.",
      econSocial: "Impact social total : Santé + Productivité + Valeur de la Vie.",
      prog: "Évolution moyenne de la charge bactérienne par étapes.",
      inact: "Courbe de réduction logarithmique attendue selon Weibull.",
      sensitivity: "Montre comment le risque total varie en modifiant un paramètre individuellement. Aide à identifier les points critiques.",
      costHosp: "Coût moyen d'une hospitalisation.",
      costAmb: "Coût d'une consultation ou traitement ambulatoire.",
      costAbsence: "Perte économique journalière due à l'incapacité.",
      costDeath: "Valeur statistique assignée à la prévention des décès (VSL).",
      doseResponse: "Visualise la probabilité de maladie en fonction de la dose ingérée.",
      alpha: "Paramètre de forma (α) du modèle Beta-Poisson.",
      beta: "Paramètre d'échelle (β) du modelo Beta-Poisson.",
      weibullDetail: "Détaille la progression de la mort thermique basée sur l'asymétrie de la courbe.",
      processing: "Réduction ou croissance lors du traitement industriel.",
      transport: "Changements de la charge bactérienne pendant le transport.",
      retail: "Changements lors de la distribution et de la vente.",
      prep: "Réduction due à la préparation ou à la cuisson domestique.",
      growthRate: "Vitesse de croissance du pathogène (Log10/h).",
      growthTime: "Durée de l'abus thermique ou du stockage.",
      delta: "Temps nécessaire pour la première réduction logarithmique.",
      p: "Paramètre de forme de la courbe d'inactivation.",
      k: "Paramètre de taux pour le modèle exponentiel.",
      d50: "Dose produisant une probabilité d'infection de 50%.",
      drSigma: "Écart type du log-dose dans le modèle Log-Normal."
    }
  }
};

const PATHOGEN_DATA = {
  salmonella: {
    es: { 
      name: "Salmonella enterica", 
      desc: "Bacilo Gram-negativo ubicuo con reservorio principal en el tracto intestinal de animales. Altamente resiliente en el ambiente. QMRA: La relación dosis-respuesta suele modelarse mediante Beta-Poisson; el riesgo crítico reside en la contaminación cruzada y el consumo de productos avícolas insuficientemente cocidos." 
    },
    en: { 
      name: "Salmonella enterica", 
      desc: "Ubiquitous Gram-negative rod with primary reservoir in animal intestinal tracts. Highly resilient in the environment. QMRA: Dose-response is typically Beta-Poisson; critical risk lies in cross-contamination and consumption of undercooked poultry products." 
    },
    fr: { 
      name: "Salmonella enterica", 
      desc: "Bâtonnet Gram négatif ubiquitaire, réservoir principal dans les intestins animaux. Très résilient. QMRA : Dose-réponse souvent Beta-Poisson ; risque critique lié à la contamination croisée et à la volaille mal cuite." 
    }
  },
  listeria: {
    es: { 
      name: "Listeria monocytogenes", 
      desc: "Patógeno psicrótrofo capaz de crecer a temperaturas de refrigeración (4°C). QMRA: Presenta baja prevalencia pero una letalidad excepcional (20-30%). Es un riesgo crítico en alimentos Listos para el Consumo (RTE) debido a su capacidad de formar biopelículas en plantas de procesamiento." 
    },
    en: { 
      name: "Listeria monocytogenes", 
      desc: "Psychrotrophic pathogen capable of growth at refrigeration temperatures (4°C). QMRA: Exhibits low prevalence but exceptional lethality (20-30%). Critical risk in Ready-to-Eat (RTE) foods due to biofilm formation in processing plants." 
    },
    fr: { 
      name: "Listeria monocytogenes", 
      desc: "Pathogène psychrotrophe capable de croître à 4°C. QMRA : Faible prévalence mais létalité exceptionnelle (20-30%). Risque critique pour les aliments Prêts à Consommer (RTE) via les biofilms industriels." 
    }
  },
  ecoli: {
    es: { 
      name: "E. coli O157:H7 (STEC)", 
      desc: "Cepa enterohemorrágica con dosis infectiva extremadamente baja (10-100 células). QMRA: Riesgo significativo de Síndrome Urémico Hemolítico (SUH). Asociado principalmente a carne de res molida y vegetales contaminados por escorrentía animal." 
    },
    en: { 
      name: "E. coli O157:H7 (STEC)", 
      desc: "Enterohemorrhagic strain with extremely low infectious dose (10-100 cells). QMRA: Significant risk of Hemolytic Uremic Syndrome (HUS). Primarily associated with ground beef and leafy greens contaminated by animal runoff." 
    },
    fr: { 
      name: "E. coli O157:H7 (STEC)", 
      desc: "Souche entérohémorragique à dose infectieuse très faible (10-100 cellules). QMRA : Risque de Syndrome Hémolytique et Urémique (SHU). Associé au bœuf haché et aux légumes contaminés." 
    }
  },
  campylobacter: {
    es: { 
      name: "Campylobacter jejuni", 
      desc: "Microaerofílico y termotolerante. Causa principal de gastroenteritis bacteriana. QMRA: Aunque no suele crecer en el alimento, su supervivencia es crítica. Altamente infeccioso; asociado a la manipulación de carne de ave cruda." 
    },
    en: { 
      name: "Campylobacter jejuni", 
      desc: "Microaerophilic and thermotolerant. Leading cause of bacterial gastroenteritis. QMRA: While it rarely grows in food, its survival is critical. Highly infectious; strictly linked to raw poultry handling." 
    },
    fr: { 
      name: "Campylobacter jejuni", 
      desc: "Microaérophile et thermotolérant. Cause majeure de gastro-entérite. QMRA : Ne croît pas souvent dans l'aliment, maar sa survie est critique. Très infectieux ; lié à la manipulation de volaille crue." 
    }
  },
  norovirus: {
    es: { 
      name: "Norovirus (Genogrupos I/II)", 
      desc: "Virus no envuelto, extremadamente contagioso y persistente. QMRA: La dosis infectiva es mínima (<20 partículas). Transmisión principal vía manipuladores de alimentos infectados o moluscos bivalvos en aguas contaminadas." 
    },
    en: { 
      name: "Norovirus (Genogroups I/II)", 
      desc: "Non-enveloped virus, extremely contagious and persistent. QMRA: Infectious dose is minimal (<20 particles). Primary transmission via infected food handlers or bivalve mollusks in contaminated waters." 
    },
    fr: { 
      name: "Norovirus (Génogroupes I/II)", 
      desc: "Virus non enveloppé, extrêmement contagieux. QMRA : Dose infectieuse minimale (<20 particules). Transmission via manipulateurs infectés ou mollusques en eaux souillées." 
    }
  },
  staph: {
    es: { 
      name: "Staphylococcus aureus", 
      desc: "Patógeno mediado por enterotoxinas termoestables. QMRA: La enfermedad ocurre por ingestión de toxina preformada cuando la carga supera 10^5 UFC/g. Crítico en alimentos con alta manipulación y rotura de cadena de frío." 
    },
    en: { 
      name: "Staphylococcus aureus", 
      desc: "Pathogen mediated by heat-stable enterotoxins. QMRA: Illness occurs by ingestion of preformed toxin when load exceeds 10^5 CFU/g. Critical in highly handled foods with cold chain breaks." 
    },
    fr: { 
      name: "Staphylococcus aureus", 
      desc: "Médiée par des entérotoxines thermostables. QMRA : Maladie due à la toxine préformée si la charge dépasse 10^5 UFC/g. Critique pour les aliments très manipulés avec rupture de chaîne du froid." 
    }
  },
  vibrio: {
    es: { 
      name: "Vibrio parahaemolyticus", 
      desc: "Bacteria halofílica marina con crecimiento explosivo en temperaturas cálidas (>20°C). QMRA: El riesgo es altamente estacional; la cinética de crecimiento post-cosecha es el factor determinante en la seguridad de mariscos crudos." 
    },
    en: { 
      name: "Vibrio parahaemolyticus", 
      desc: "Marine halophilic bacteria with explosive growth at warm temperatures (>20°C). QMRA: Risk is highly seasonal; post-harvest growth kinetics is the determining factor in raw seafood safety." 
    },
    fr: { 
      name: "Vibrio parahaemolyticus", 
      desc: "Bactérie marine halophile à croissance explosive (>20°C). QMRA : Risque très saisonnier ; la cinétique de croissance post-récolte est déterminante pour les fruits de mer crus." 
    }
  },
  vibrio_cholerae: {
    es: { 
      name: "Vibrio cholerae (O1/O139)", 
      desc: "Agente causal del cólera. QMRA: Dosis infectiva variable según la matriz; virulencia extrema que causa deshidratación severa. Crítico en áreas con saneamiento deficiente y consumo de productos del mar contaminados." 
    },
    en: { 
      name: "Vibrio cholerae (O1/O139)", 
      desc: "Causative agent of cholera. QMRA: Infectious dose varies by food matrix; extreme virulence causing severe dehydration. Critical in areas with poor sanitation and contaminated seafood consumption." 
    },
    fr: { 
      name: "Vibrio cholerae (O1/O139)", 
      desc: "Agent du choléra. QMRA : Dose infectieuse variable selon la matrice ; virulence extrême (déshydratation sévère). Critique en zones d'assainissement précaire et produits marins souillés." 
    }
  },
  vibrio_vulnificus: {
    es: {
      name: "Vibrio vulnificus",
      desc: "Bacteria halofílica altamente virulenta presente en aguas marinas cálidas. QMRA: Es el patógeno transmitido por productos del mar más letal. La septicemia primaria tiene una tasa de mortalidad superior al 30%. Crítico en el consumo de ostras crudas y mariscos, especialmente en individuos con enfermedades hepáticas crónicas."
    },
    en: {
      name: "Vibrio vulnificus",
      desc: "Highly virulent halophilic bacteria found in warm marine waters. QMRA: It is the most lethal foodborne pathogen associated with seafood. Primary septicemia has a mortality rate exceeding 30%. Critical in raw oyster and shellfish consumption, especially for individuals with chronic liver disease."
    },
    fr: {
      name: "Vibrio vulnificus",
      desc: "Bactérie halophile hautement virulente des eaux marines chaudes. QMRA : C'est le pathogène des produits de la mer le plus mortel. La septicémie primaire présente une mortalité supérieure à 30%. Critique pour la consommation d'huîtres crues, surtout chez les sujets souffrant de maladies hépatiques."
    }
  },
  shigella: {
    es: { 
      name: "Shigella sonnei/flexneri", 
      desc: "Reservorio exclusivamente humano. QMRA: Dosis infectiva bajísima (10-100 organismos). La transmisión suele ser fecal-oral a través de vegetales crudos o ensaladas preparadas con higiene deficiente." 
    },
    en: { 
      name: "Shigella sonnei/flexneri", 
      desc: "Exclusively human reservoir. QMRA: Extremely low infectious dose (10-100 organisms). Transmission is usually fecal-oral through raw vegetables or salads prepared with poor hygiene." 
    },
    fr: { 
      name: "Shigella sonnei/flexneri", 
      desc: "Réservoir exclusivement humain. QMRA : Dose infectieuse très faible (10-100 organismes). Transmission féco-orale via légumes crus ou salades préparées sans hygiène." 
    }
  }
};

const FOOD_DATA = {
  poultry: {
    es: { name: "Pollo / Aves", desc: "Carne de pollo y aves de corral. Requiere cocción completa." },
    en: { name: "Poultry", desc: "Chicken and poultry meat. Requires complete cooking." },
    fr: { name: "Volaille", desc: "Viande de poulet et de volaille. Nécessite une cuisson complète." }
  },
  beef: {
    es: { name: "Carne de Res", desc: "Cortes de carne bovina. Riesgo de E. coli en productos molidos." },
    en: { name: "Beef", desc: "Bovine meat cuts. E. coli risk in ground products." },
    fr: { name: "Bœuf", desc: "Coupes de viande bovine. Risque d'E. coli dans les produits hachés." }
  },
  leafy: {
    es: { name: "Vegetales de Hoja", desc: "Lechuga, espinaca. Riesgo de contaminación por riego." },
    en: { name: "Leafy Greens", desc: "Lettuce, spinach. Risk of irrigation contamination." },
    fr: { name: "Légumes Feuilles", desc: "Laitue, épinards. Risque de contamination par l'irrigation." }
  },
  milk: {
    es: { name: "Leche / Quesos", desc: "Lácteos. La pasteurización es crítica." },
    en: { name: "Milk / Cheese", desc: "Dairy. Pasteurization is critical." },
    fr: { name: "Lait / Fromage", desc: "Produits laitiers. La pasteurisation est critique." }
  },
  fish: {
    es: { name: "Pescados / Mariscos", desc: "Productos del mar. Riesgo de Vibrio y Listeria." },
    en: { name: "Fish / Seafood", desc: "Seafood products. Risk of Vibrio and Listeria." },
    fr: { name: "Poisson / Fruits de Mer", desc: "Produits de la mer. Risque de Vibrio et Listeria." }
  },
  rte: {
    es: { name: "Listos para Consumo (RTE)", desc: "Alimentos que no requieren cocción. Riesgo de recontaminación." },
    en: { name: "Ready-to-Eat (RTE)", desc: "Foods requiring no cooking. Risk of recontamination." },
    fr: { name: "Prêts à Consommer (RTE)", desc: "Aliments ne nécessitant pas de cuisson. Risque de recontamination." }
  }
};

const PATHOGEN_PROFILES: PathogenProfile[] = [
  { id: 'salmonella', name: 'Salmonella', description: '', associatedFoods: ['poultry', 'beef', 'egg', 'rte'], params: { doseResponseModel: DoseResponseModel.BETA_POISSON, alpha: 0.13, beta: 51.45, k: 0.01, d50: 100, drSigma: 0.5, illnessProb: 0.3, hospRate: 0.22, mortalityRate: 0.003, processingDeltaLog: -2.5, growthRate: 0.08, growthTime: 12, absenceDays: 4 } },
  { id: 'listeria', name: 'Listeria', description: '', associatedFoods: ['leafy', 'milk', 'fish', 'rte'], params: { doseResponseModel: DoseResponseModel.BETA_POISSON, alpha: 0.1, beta: 100000000, k: 0.00000001, d50: 1000000, drSigma: 1.0, illnessProb: 0.15, hospRate: 0.93, mortalityRate: 0.18, processingDeltaLog: -5.0, growthRate: 0.015, growthTime: 48, distributionDeltaLog: 1.5, absenceDays: 20 } },
  { id: 'ecoli', name: 'E. coli', description: '', associatedFoods: ['leafy', 'beef', 'rte'], params: { doseResponseModel: DoseResponseModel.BETA_POISSON, alpha: 0.15, beta: 40, k: 0.02, d50: 50, drSigma: 0.4, illnessProb: 0.45, hospRate: 0.26, mortalityRate: 0.01, processingDeltaLog: -3.5, growthRate: 0.04, growthTime: 8, absenceDays: 7 } },
  { id: 'campylobacter', name: 'Campylobacter', description: '', associatedFoods: ['poultry', 'milk'], params: { doseResponseModel: DoseResponseModel.BETA_POISSON, alpha: 0.145, beta: 7.59, k: 0.05, d50: 10, drSigma: 0.3, illnessProb: 0.4, hospRate: 0.1, mortalityRate: 0.0001, processingDeltaLog: -2.0, growthRate: 0.01, growthTime: 6, absenceDays: 5 } },
  { id: 'norovirus', name: 'Norovirus', description: '', associatedFoods: ['leafy', 'fish', 'rte'], params: { doseResponseModel: DoseResponseModel.BETA_POISSON, alpha: 0.04, beta: 0.05, k: 0.5, d50: 1, drSigma: 0.2, illnessProb: 0.6, hospRate: 0.01, mortalityRate: 0.00005, processingDeltaLog: -1.0, growthRate: 0.0, growthTime: 0, absenceDays: 2 } },
  { id: 'staph', name: 'Staph. aureus', description: '', associatedFoods: ['milk', 'poultry', 'rte'], params: { doseResponseModel: DoseResponseModel.BETA_POISSON, alpha: 0.05, beta: 100000, k: 0.00001, d50: 50000, drSigma: 0.8, illnessProb: 0.8, hospRate: 0.05, mortalityRate: 0.0001, processingDeltaLog: -2.0, growthRate: 0.12, growthTime: 12, absenceDays: 1 } },
  { id: 'vibrio', name: 'Vibrio', description: '', associatedFoods: ['fish'], params: { doseResponseModel: DoseResponseModel.BETA_POISSON, alpha: 0.18, beta: 100000000, k: 0.00000001, d50: 1000000, drSigma: 1.0, illnessProb: 0.5, hospRate: 0.37, mortalityRate: 0.03, processingDeltaLog: -1.0, growthRate: 0.18, growthTime: 8, absenceDays: 3 } },
  { id: 'vibrio_cholerae', name: 'Vibrio cholerae', description: '', associatedFoods: ['fish', 'rte'], params: { doseResponseModel: DoseResponseModel.BETA_POISSON, alpha: 0.2, beta: 1000000, k: 0.000001, d50: 10000, drSigma: 0.6, illnessProb: 0.7, hospRate: 0.6, mortalityRate: 0.01, processingDeltaLog: -1.0, growthRate: 0.25, growthTime: 6, absenceDays: 10 } },
  { id: 'vibrio_vulnificus', name: 'Vibrio vulnificus', description: '', associatedFoods: ['fish'], params: { doseResponseModel: DoseResponseModel.BETA_POISSON, alpha: 0.2, beta: 100000, k: 0.00001, d50: 1000, drSigma: 0.5, illnessProb: 0.85, hospRate: 0.95, mortalityRate: 0.35, processingDeltaLog: -1.0, growthRate: 0.22, growthTime: 8, absenceDays: 30 } },
  { id: 'shigella', name: 'Shigella spp.', description: '', associatedFoods: ['leafy', 'rte'], params: { doseResponseModel: DoseResponseModel.BETA_POISSON, alpha: 0.12, beta: 10, k: 0.05, d50: 10, drSigma: 0.3, illnessProb: 0.8, hospRate: 0.20, mortalityRate: 0.006, processingDeltaLog: -0.5, growthRate: 0.06, growthTime: 12, absenceDays: 5 } }
];

const FOOD_PROFILES: FoodProfile[] = [
  { id: 'poultry', name: 'Poultry', description: '', icon: 'Beef', typicalPathogens: ['salmonella', 'campylobacter', 'staph'], defaultServingSize: 200, defaultPrevalence: 0.25 },
  { id: 'beef', name: 'Beef', description: '', icon: 'Beef', typicalPathogens: ['ecoli', 'salmonella'], defaultServingSize: 150, defaultPrevalence: 0.10 },
  { id: 'leafy', name: 'Leafy Greens', description: '', icon: 'Salad', typicalPathogens: ['ecoli', 'shigella', 'norovirus'], defaultServingSize: 50, defaultPrevalence: 0.05 },
  { id: 'milk', name: 'Milk/Dairy', description: '', icon: 'Droplets', typicalPathogens: ['listeria', 'staph', 'campylobacter'], defaultServingSize: 150, defaultPrevalence: 0.08 },
  { id: 'fish', name: 'Fish/Seafood', description: '', icon: 'Fish', typicalPathogens: ['listeria', 'vibrio', 'vibrio_cholerae', 'vibrio_vulnificus', 'norovirus'], defaultServingSize: 125, defaultPrevalence: 0.12 },
  { id: 'rte', name: 'RTE Foods', description: '', icon: 'ShoppingBag', typicalPathogens: ['listeria', 'salmonella', 'norovirus', 'staph', 'ecoli', 'shigella', 'vibrio_cholerae'], defaultServingSize: 150, defaultPrevalence: 0.04 }
];

const VALIDATION_RULES: Record<string, { min: number, max: number }> = {
  prevalence: { min: 0, max: 1 },
  servingSize: { min: 1, max: 10000 },
  populationSize: { min: 1, max: 1000000000 },
  servingsPerYear: { min: 0, max: 10000 },
  iterations: { min: 100, max: 100000 },
  initialLogMean: { min: -10, max: 15 },
  initialLogStd: { min: 0, max: 5 },
  processingDeltaLog: { min: -15, max: 15 },
  transportDeltaLog: { min: -15, max: 15 },
  distributionDeltaLog: { min: -15, max: 15 },
  preparationDeltaLog: { min: -15, max: 15 },
  growthRate: { min: 0, max: 5 },
  growthRateStd: { min: 0, max: 2 },
  growthTime: { min: 0, max: 2000 },
  delta: { min: 0.01, max: 1000 },
  deltaStd: { min: 0, max: 100 },
  p: { min: 0.1, max: 10 },
  pStd: { min: 0, max: 5 },
  inactivationTime: { min: 0, max: 1000 },
  alpha: { min: 0.0001, max: 1000 },
  beta: { min: 0.0001, max: 1000000000 },
  k: { min: 0.0000001, max: 100 },
  d50: { min: 0.1, max: 1000000000 },
  drSigma: { min: 0.1, max: 10 },
  illnessProb: { min: 0, max: 1 },
  hospRate: { min: 0, max: 1 },
  mortalityRate: { min: 0, max: 1 },
  absenceDays: { min: 0, max: 365 },
  costHosp: { min: 0, max: 1000000 },
  costAmb: { min: 0, max: 100000 },
  costAbsence: { min: 0, max: 10000 },
  costDeath: { min: 0, max: 50000000 }
};

const DEFAULT_PARAMS: SimulationParams = {
  prevalence: 0.15, initialLogMean: 1.5, initialLogStd: 0.5,
  servingSize: 100, populationSize: 100000, servingsPerYear: 52,
  iterations: 10000, processingDeltaLog: -3.0, transportDeltaLog: 0.5,
  distributionDeltaLog: 0.2, preparationDeltaLog: -2.0, growthRate: 0.05, growthRateStd: 0,
  growthTime: 12, delta: 5, deltaStd: 0, p: 1.2, pStd: 0, inactivationTime: 10,
  doseResponseModel: DoseResponseModel.BETA_POISSON,
  alpha: 0.25, beta: 1500, k: 0.01, d50: 1000, drSigma: 0.5,
  illnessProb: 0.5, hospRate: 0.22,
  mortalityRate: 0.005, absenceDays: 4.5,
  costHosp: 15000, costAmb: 500, costAbsence: 200, costDeath: 2000000
};

const InfoTooltip: React.FC<{ text: string }> = ({ text }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="relative inline-block ml-1.5 align-middle group no-print">
      <HelpCircle 
        size={14} 
        className="text-slate-300 dark:text-slate-500 hover:text-blue-500 cursor-help transition-colors"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      />
      {show && (
        <div className="absolute z-50 bottom-full right-0 mb-3 w-72 p-4 bg-slate-900/95 dark:bg-slate-800/95 text-slate-100 text-[11px] leading-relaxed rounded-2xl shadow-2xl border border-slate-700/50 backdrop-blur-xl animate-in">
          <div className="flex items-start gap-3">
            <Info size={14} className="mt-0.5 shrink-0 text-blue-400" />
            <span className="font-medium">{text}</span>
          </div>
          <div className="absolute top-full right-1.5 border-8 border-transparent border-t-slate-900/95 dark:border-t-slate-800/95"></div>
        </div>
      )}
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode; helpText: string }> = ({ title, icon, helpText }) => (
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
      {icon} {title}
    </h2>
    <div className="flex items-center gap-1">
      <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Help</span>
      <InfoTooltip text={helpText} />
    </div>
  </div>
);

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isDoseChart = payload[0].payload.dose !== undefined;
    const isCurrency = payload[0].name?.toLowerCase().includes('impact') || payload[0].dataKey === 'impact';
    
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/60 dark:border-slate-800/60 p-4 rounded-2xl shadow-2xl text-[11px] min-w-[160px]">
        <div className="font-bold text-slate-800 dark:text-slate-100 mb-1">
           {isDoseChart ? `Log10: ${label}` : label}
        </div>
        {payload.map((p: any, i: number) => (
          <div key={i} className="text-blue-600 dark:text-blue-400 font-mono">
            <span className="text-slate-500 dark:text-slate-400 font-sans mr-1">{p.name}:</span>
            {isCurrency ? '$' : ''}
            {typeof p.value === 'number' ? p.value.toLocaleString(undefined, { maximumFractionDigits: isCurrency ? 2 : 6 }) : p.value}
            {isDoseChart && p.payload.dose && (
              <div className="text-[9px] text-slate-400 mt-0.5">Dose: {p.payload.dose} CFU</div>
            )}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ComparisonModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedSims: SavedSimulation[];
  t: any;
  language: string;
}> = ({ isOpen, onClose, selectedSims, t, language }) => {
  if (!isOpen) return null;

  const formatValue = (val: number, isCurrency = false) => {
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', {
      minimumFractionDigits: isCurrency ? 2 : 4,
      maximumFractionDigits: isCurrency ? 2 : 4
    }).format(val);
  };

  const getEconomicTotal = (sim: SavedSimulation) => {
    const factor = sim.params.servingsPerYear;
    const annualHosp = sim.results.summary.hospitalized * factor;
    const annualIll = sim.results.summary.ill * factor;
    const annualAbsence = sim.results.summary.absence * factor;
    const annualDeaths = sim.results.summary.deaths * factor;
    const annualNonHosp = Math.max(0, annualIll - annualHosp);
    return (annualHosp * sim.params.costHosp) + (annualNonHosp * sim.params.costAmb) + (annualAbsence * sim.params.costAbsence) + (annualDeaths * sim.params.costDeath);
  };

  const getMinMax = (key: string, isResult = true) => {
    const values = selectedSims.map(sim => isResult ? (sim.results.summary as any)[key] : (sim.params as any)[key]);
    return { min: Math.min(...values), max: Math.max(...values) };
  };

  const econTotals = selectedSims.map(getEconomicTotal);
  const econMinMax = { min: Math.min(...econTotals), max: Math.max(...econTotals) };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in no-print">
      <div className="bg-white dark:bg-slate-900 w-full max-w-6xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative flex flex-col max-h-[90vh]">
        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
              <BarChart3 className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black">{t.comparisonTitle}</h2>
              <p className="text-slate-500 font-medium text-sm">{selectedSims.length} {t.scenario.toLowerCase()}s</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-8 custom-scrollbar">
          <div className="min-w-[800px]">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white dark:bg-slate-900 z-10 p-4 text-left border-b border-slate-100 dark:border-slate-800 w-64">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t.scenario}</span>
                  </th>
                  {selectedSims.map((sim, idx) => (
                    <th key={sim.id} className="p-4 text-center border-b border-slate-100 dark:border-slate-800 min-w-[200px]">
                      <div className="space-y-1">
                        <div className="text-xs font-black text-blue-600 uppercase tracking-wider">#{selectedSims.length - idx}</div>
                        <div className="text-sm font-bold">{sim.pathogenName}</div>
                        <div className="text-[10px] text-slate-400 font-medium">{sim.foodName}</div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {/* Risk Metrics */}
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td colSpan={selectedSims.length + 1} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.riskSummary}</td>
                </tr>
                <tr>
                  <td className="sticky left-0 bg-white dark:bg-slate-900 z-10 p-4 text-xs font-bold text-slate-600 dark:text-slate-400">{t.infections} ({t.mean})</td>
                  {selectedSims.map(sim => {
                    const { min, max } = getMinMax('infected');
                    const isMax = sim.results.summary.infected === max && min !== max;
                    const isMin = sim.results.summary.infected === min && min !== max;
                    return (
                      <td key={sim.id} className={`p-4 text-center text-sm font-black ${isMax ? 'text-red-500 bg-red-50/30' : isMin ? 'text-emerald-500 bg-emerald-50/30' : ''}`}>
                        {formatValue(sim.results.summary.infected)}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="sticky left-0 bg-white dark:bg-slate-900 z-10 p-4 text-xs font-bold text-slate-600 dark:text-slate-400">{t.deaths} ({t.mean})</td>
                  {selectedSims.map(sim => {
                    const { min, max } = getMinMax('deaths');
                    const isMax = sim.results.summary.deaths === max && min !== max;
                    const isMin = sim.results.summary.deaths === min && min !== max;
                    return (
                      <td key={sim.id} className={`p-4 text-center text-sm font-black ${isMax ? 'text-red-600 bg-red-50/30' : isMin ? 'text-emerald-600 bg-emerald-50/30' : ''}`}>
                        {formatValue(sim.results.summary.deaths)}
                      </td>
                    );
                  })}
                </tr>
                <tr>
                  <td className="sticky left-0 bg-white dark:bg-slate-900 z-10 p-4 text-xs font-bold text-slate-600 dark:text-slate-400">{t.socialImpact} (USD)</td>
                  {selectedSims.map((sim, idx) => {
                    const total = econTotals[idx];
                    const isMax = total === econMinMax.max && econMinMax.min !== econMinMax.max;
                    const isMin = total === econMinMax.min && econMinMax.min !== econMinMax.max;
                    return (
                      <td key={sim.id} className={`p-4 text-center text-sm font-black ${isMax ? 'text-red-600 bg-red-50/30' : isMin ? 'text-emerald-600 bg-emerald-50/30' : ''}`}>
                        ${formatValue(total, true)}
                      </td>
                    );
                  })}
                </tr>

                {/* Key Parameters */}
                <tr className="bg-slate-50/50 dark:bg-slate-800/20">
                  <td colSpan={selectedSims.length + 1} className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.paramImpact}</td>
                </tr>
                <tr>
                  <td className="sticky left-0 bg-white dark:bg-slate-900 z-10 p-4 text-xs font-bold text-slate-600 dark:text-slate-400">{t.prevalence}</td>
                  {selectedSims.map(sim => (
                    <td key={sim.id} className="p-4 text-center text-sm font-mono">{(sim.params.prevalence * 100).toFixed(1)}%</td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky left-0 bg-white dark:bg-slate-900 z-10 p-4 text-xs font-bold text-slate-600 dark:text-slate-400">{t.initialLoad} (Log)</td>
                  {selectedSims.map(sim => (
                    <td key={sim.id} className="p-4 text-center text-sm font-mono">{sim.params.initialLogMean.toFixed(2)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky left-0 bg-white dark:bg-slate-900 z-10 p-4 text-xs font-bold text-slate-600 dark:text-slate-400">{t.process} (Δ Log)</td>
                  {selectedSims.map(sim => (
                    <td key={sim.id} className="p-4 text-center text-sm font-mono">{sim.params.processingDeltaLog.toFixed(2)}</td>
                  ))}
                </tr>
                <tr>
                  <td className="sticky left-0 bg-white dark:bg-slate-900 z-10 p-4 text-xs font-bold text-slate-600 dark:text-slate-400">{t.prep} (Δ Log)</td>
                  {selectedSims.map(sim => (
                    <td key={sim.id} className="p-4 text-center text-sm font-mono">{sim.params.preparationDeltaLog.toFixed(2)}</td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-8 border-t border-slate-100 dark:border-slate-800 shrink-0">
          <button 
            onClick={onClose}
            className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold hover:scale-[1.01] active:scale-95 transition-all shadow-xl"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};

const ParamInput: React.FC<{
  label: string;
  name: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  tooltip: string;
  step?: string;
  min?: string;
  icon?: React.ReactNode;
  error?: string;
}> = ({ label, name, value, onChange, tooltip, step = "1", min = "0", icon, error }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        {icon && <span className="text-slate-400">{icon}</span>}
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-tight">{label}</span>
      </div>
      <InfoTooltip text={tooltip} />
    </div>
    <div className="relative">
      <input 
        type="number" 
        name={name} 
        value={value} 
        onChange={onChange} 
        step={step}
        min={min}
        className={`w-full bg-slate-50 dark:bg-slate-800 border ${error ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-500'} focus:ring-1 rounded-lg p-2 text-sm transition-all outline-none text-slate-900 dark:text-slate-100`}
      />
      {error && (
        <div className="absolute -bottom-4 left-0 flex items-center gap-1 text-[9px] text-red-500 font-bold whitespace-nowrap bg-white dark:bg-slate-900 px-1 rounded-full border border-red-500/20 shadow-sm z-10 animate-in">
          <AlertCircle size={8} /> {error}
        </div>
      )}
    </div>
  </div>
);

interface SensitivityItem {
  name: string;
  impact: number;
}

const getInfectionProbability = (dose: number, p: SimulationParams) => {
  switch (p.doseResponseModel) {
    case DoseResponseModel.EXPONENTIAL:
      return stats.exponentialInfProb(dose, p.k);
    case DoseResponseModel.LOG_LOGISTIC:
      return stats.logLogisticInfProb(dose, p.d50, p.beta);
    case DoseResponseModel.LOG_NORMAL:
      return stats.logNormalInfProb(dose, p.d50, p.drSigma);
    case DoseResponseModel.BETA_POISSON:
    default:
      return stats.betaPoissonInfProb(dose, p.alpha, p.beta);
  }
};

const calculateDoseImpact = (p: SimulationParams) => {
  let log = p.initialLogMean;
  log += p.processingDeltaLog;
  log += p.transportDeltaLog;
  log += (p.growthRate * p.growthTime);
  log += p.distributionDeltaLog;
  const inact = p.delta > 0 ? -Math.pow(p.inactivationTime / p.delta, p.p) : 0;
  log += p.preparationDeltaLog + inact;
  const dose = Math.pow(10, log) * p.servingSize;
  return getInfectionProbability(dose, p) * p.prevalence;
};

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('probrisk_theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('probrisk_lang');
    return (saved as Language) || 'es';
  });

  const [showAbout, setShowAbout] = useState(false);
  const [showGuide, setShowGuide] = useState(true);

  const t = TRANSLATIONS[language];

  const [selectedFoodId, setSelectedFoodId] = useState<string>('poultry');
  const [selectedPathogenId, setSelectedPathogenId] = useState<string>('salmonella');
  const [params, setParams] = useState<SimulationParams>(DEFAULT_PARAMS);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [results, setResults] = useState<SimulationResults & { sensitivity: SensitivityItem[] } | null>(null);
  const [savedSimulations, setSavedSimulations] = useState<SavedSimulation[]>(() => {
    const saved = localStorage.getItem('probrisk_saved');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedSimIds, setSelectedSimIds] = useState<string[]>([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);
  const isInitializing = useRef(true);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem('probrisk_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('probrisk_lang', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('probrisk_saved', JSON.stringify(savedSimulations));
  }, [savedSimulations]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const stateEncoded = urlParams.get('s');
    if (stateEncoded) {
      try {
        const decoded = JSON.parse(atob(stateEncoded));
        if (decoded.foodId) setSelectedFoodId(decoded.foodId);
        if (decoded.pathogenId) setSelectedPathogenId(decoded.pathogenId);
        if (decoded.params) setParams(decoded.params);
      } catch (e) { console.error("Error decoding shared state", e); }
    }
    isInitializing.current = false;
  }, []);

  useEffect(() => {
    if (isInitializing.current) return;
    const food = FOOD_PROFILES.find(f => f.id === selectedFoodId);
    const pathogen = PATHOGEN_PROFILES.find(p => p.id === selectedPathogenId);
    if (food && pathogen) {
      setParams(prev => ({
        ...prev,
        servingSize: food.defaultServingSize,
        prevalence: food.defaultPrevalence,
        ...pathogen.params
      }));
      setErrors({});
    }
  }, [selectedFoodId, selectedPathogenId]);

  const filteredPathogens = useMemo(() => {
    return PATHOGEN_PROFILES.filter(p => p.associatedFoods.includes(selectedFoodId));
  }, [selectedFoodId]);

  useEffect(() => {
    if (!filteredPathogens.find(p => p.id === selectedPathogenId)) {
      if (filteredPathogens.length > 0) setSelectedPathogenId(filteredPathogens[0].id);
    }
  }, [selectedFoodId, filteredPathogens, selectedPathogenId]);

  const clearResults = useCallback(() => {
    setResults(null);
  }, []);

  const saveSimulation = useCallback(() => {
    if (!results) return;
    const food = FOOD_PROFILES.find(f => f.id === selectedFoodId);
    const pathogen = PATHOGEN_PROFILES.find(p => p.id === selectedPathogenId);
    
    const newSaved: SavedSimulation = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      params: { ...params },
      results: { ...results },
      foodName: food ? FOOD_DATA[food.id as keyof typeof FOOD_DATA][language].name : selectedFoodId,
      pathogenName: pathogen ? PATHOGEN_DATA[pathogen.id as keyof typeof PATHOGEN_DATA][language].name : selectedPathogenId
    };
    
    setSavedSimulations(prev => [newSaved, ...prev].slice(0, 10)); // Keep last 10
  }, [results, params, selectedFoodId, selectedPathogenId, language]);

  const removeSavedSimulation = (id: string) => {
    setSavedSimulations(prev => prev.filter(s => s.id !== id));
  };

  const clearSavedSimulations = () => {
    setSavedSimulations([]);
  };

  const loadSavedSimulation = (sim: SavedSimulation) => {
    setParams(sim.params);
    setResults(sim.results);
    // Try to find matching food/pathogen IDs if possible, but params are the priority
    // We don't strictly need to update selectedFoodId/selectedPathogenId if the params are restored
  };

  const toggleSimulationSelection = (id: string) => {
    setSelectedSimIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const runSimulation = useCallback(() => {
    if (Object.keys(errors).length > 0) return;
    setIsSimulating(true);
    setTimeout(() => {
      const iterations = params.iterations || 10000;
      const illCases: number[] = [];
      const totals = { infected: 0, ill: 0, hospitalized: 0, deaths: 0, absence: 0 };
      const avgLoads = { initial: 0, processing: 0, transport: 0, distribution: 0, preparation: 0 };
      let contaminatedCount = 0;

      for (let i = 0; i < iterations; i++) {
        if (Math.random() > params.prevalence) { illCases.push(0); continue; }
        contaminatedCount++;
        let currentLog = stats.normal(params.initialLogMean, params.initialLogStd);
        avgLoads.initial += currentLog;
        currentLog += params.processingDeltaLog;
        avgLoads.processing += currentLog;
        currentLog += params.transportDeltaLog;
        avgLoads.transport += currentLog;
        
        // Growth with uncertainty
        let currentGrowthRate = params.growthRate;
        if (params.growthRateStd > 0) {
          currentGrowthRate = stats.normal(params.growthRate, params.growthRateStd);
        }
        currentLog += (currentGrowthRate * params.growthTime);
        
        currentLog += params.distributionDeltaLog;
        avgLoads.distribution += currentLog;
        
        // Inactivation with uncertainty
        let currentDelta = params.delta;
        if (params.deltaStd > 0) {
          currentDelta = Math.max(0.001, stats.normal(params.delta, params.deltaStd));
        }
        let currentP = params.p;
        if (params.pStd > 0) {
          currentP = Math.max(0.001, stats.normal(params.p, params.pStd));
        }
        
        const inactivationReduction = currentDelta > 0 ? -Math.pow(params.inactivationTime / currentDelta, currentP) : 0;
        currentLog += params.preparationDeltaLog + inactivationReduction;
        avgLoads.preparation += currentLog;
        const dose = Math.pow(10, currentLog) * params.servingSize;
        const pInf = getInfectionProbability(dose, params);
        const infectedCount = pInf * params.populationSize;
        const illCount = infectedCount * params.illnessProb;
        totals.infected += infectedCount; totals.ill += illCount;
        totals.hospitalized += illCount * params.hospRate; totals.deaths += illCount * params.mortalityRate;
        totals.absence += illCount * params.absenceDays; illCases.push(illCount);
      }

      const meanIll = totals.ill / iterations;
      const sorted = [...illCases].sort((a, b) => a - b);
      const annualCases = meanIll * params.servingsPerYear;
      let variance = 0, thirdMoment = 0, fourthMoment = 0;
      illCases.forEach(val => {
        const diff = val - meanIll;
        variance += Math.pow(diff, 2); thirdMoment += Math.pow(diff, 3); fourthMoment += Math.pow(diff, 4);
      });
      const sd = Math.sqrt(variance / iterations);
      const skewness = sd > 0 ? (thirdMoment / iterations) / Math.pow(sd, 3) : 0;
      const kurtosis = sd > 0 ? (fourthMoment / iterations) / Math.pow(sd, 4) - 3 : 0;
      const maxVal = sorted[Math.floor(iterations * 0.99)] || 10;
      const binCount = 40; const binSize = maxVal / binCount;
      const histogramData = Array(binCount).fill(0).map((_, i) => {
        const x = binSize * i;
        const count = illCases.filter(v => v >= x && v < x + binSize).length;
        return { x, name: Math.round(x).toString(), value: count };
      });
      const maxBin = histogramData.reduce((prev, current) => (prev.value > current.value) ? prev : current);
      const denom = contaminatedCount > 0 ? contaminatedCount : 1;

      const testParams = [
        { key: 'prevalence', name: t.prevalence, delta: 0.1 },
        { key: 'initialLogMean', name: t.initialLoad, delta: 0.5 },
        { key: 'growthRate', name: t.kinetics, delta: 0.05 },
        { key: 'processingDeltaLog', name: t.process, delta: 0.5 },
        { key: 'preparationDeltaLog', name: t.prep, delta: 0.5 }
      ];

      const baseValue = calculateDoseImpact(params);
      const sensitivity = testParams.map(p => {
        const highParams = { ...params, [p.key]: (params as any)[p.key] + p.delta };
        const highValue = calculateDoseImpact(highParams);
        const impact = baseValue > 0 ? ((highValue - baseValue) / baseValue) * 100 : 0;
        return { name: p.name, impact };
      }).sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

      setResults({
        summary: { infected: totals.infected / iterations, ill: meanIll, hospitalized: totals.hospitalized / iterations, deaths: totals.deaths / iterations, absence: totals.absence / iterations, annualCases, individualYearlyRisk: annualCases / params.populationSize },
        histogram: histogramData,
        stats: { mean: meanIll, sd, p5: sorted[Math.floor(iterations * 0.05)], p95: sorted[Math.floor(iterations * 0.95)], ciLow: sorted[Math.floor(iterations * 0.025)], ciHigh: sorted[Math.floor(iterations * 0.975)], median: sorted[Math.floor(iterations / 2)], mode: parseFloat(maxBin.name), skewness, kurtosis },
        stageProgression: [
          { name: t.initialLoad.split(' ')[0], value: avgLoads.initial / denom },
          { name: t.process.substring(0, 5), value: avgLoads.processing / denom },
          { name: t.transport.substring(0, 5), value: avgLoads.transport / denom },
          { name: t.retail.substring(0, 5), value: avgLoads.distribution / denom },
          { name: t.prep.substring(0, 5), value: avgLoads.preparation / denom }
        ],
        sensitivity
      });
      setIsSimulating(false);
    }, 400);
  }, [params, t, errors]);

  const economicSummary = useMemo(() => {
    if (!results) return null;
    const factor = params.servingsPerYear;
    const annualHosp = results.summary.hospitalized * factor;
    const annualIll = results.summary.ill * factor;
    const annualAbsence = results.summary.absence * factor;
    const annualDeaths = results.summary.deaths * factor;

    // Refinado: El costo sanitario total considera el costo de hospitalización para los graves 
    // y el ambulatorio solo para el resto de los enfermos para evitar duplicidad, 
    // bajo el supuesto de que el usuario ingresa el costo total del evento.
    const annualNonHosp = Math.max(0, annualIll - annualHosp);
    const sanitarios = (annualHosp * params.costHosp) + (annualNonHosp * params.costAmb);
    const productividad = (annualAbsence * params.costAbsence);
    const externalidades = (annualDeaths * params.costDeath);
    
    return { sanitarios, productividad, externalidades, total: sanitarios + productividad + externalidades };
  }, [results, params]);

  const weibullInactivationData = useMemo(() => {
    if (!params.delta || params.delta <= 0) return [];
    const data = []; const steps = 20;
    const duration = Math.max(params.inactivationTime, params.delta * 3);
    for (let i = 0; i <= steps; i++) {
      const tValue = (duration / steps) * i;
      const logReduction = -Math.pow(tValue / params.delta, params.p);
      data.push({ time: tValue.toFixed(1), reduction: parseFloat(logReduction.toFixed(3)) });
    }
    return data;
  }, [params.delta, params.p, params.inactivationTime]);

  const weibullTableData = useMemo(() => {
    if (!params.delta || params.delta <= 0) return [];
    const steps = 4;
    const data = [];
    for (let i = 0; i <= steps; i++) {
      const t = (params.inactivationTime / steps) * i;
      const intermediate = Math.pow(t / params.delta, params.p);
      const logReduction = -intermediate;
      data.push({ t, intermediate, logReduction });
    }
    return data;
  }, [params.delta, params.p, params.inactivationTime]);

  const doseResponseData = useMemo(() => {
    const data = [];
    const steps = 50;
    for (let i = 0; i <= steps; i++) {
      const logDose = (10 / steps) * i;
      const doseValue = Math.pow(10, logDose);
      const pInf = getInfectionProbability(doseValue, params);
      const pIll = pInf * params.illnessProb;
      data.push({ 
        dose: doseValue.toExponential(2), 
        prob: parseFloat(pIll.toFixed(6)),
        logDose: logDose.toFixed(1)
      });
    }
    return data;
  }, [params]);

  const formatEconomicValue = (val: number | undefined) => {
    if (val === undefined) return '0.00';
    return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : 'en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const validateField = (name: string, value: number) => {
    const rules = VALIDATION_RULES[name];
    if (!rules) return "";
    if (isNaN(value)) return t.errorRequired;
    if (value < rules.min || value > rules.max) {
      return t.errorRange.replace('{min}', rules.min.toString()).replace('{max}', rules.max.toString());
    }
    return "";
  };

  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'doseResponseModel') {
      setParams(prev => ({ ...prev, [name]: value as DoseResponseModel }));
      return;
    }

    const numVal = parseFloat(value);
    const errorMsg = validateField(name, numVal);
    
    setErrors(prev => {
      const updated = { ...prev };
      if (errorMsg) updated[name] = errorMsg;
      else delete updated[name];
      return updated;
    });

    setParams(prev => ({ ...prev, [name]: isNaN(numVal) ? prev[name as keyof SimulationParams] : numVal }));
  };

  const generateShareUrl = () => {
    const state = { params, foodId: selectedFoodId, pathogenId: selectedPathogenId };
    const encoded = btoa(JSON.stringify(state));
    const url = `${window.location.origin}${window.location.pathname}?s=${encoded}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const exportPDF = async () => {
    if (!resultsRef.current) return;
    const canvas = await html2canvas(resultsRef.current, { scale: 2, useCORS: true, backgroundColor: darkMode ? '#020617' : '#f8fafc' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`ProbRisk-Report-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 md:p-8 transition-colors font-sans">
      {/* About Modal */}
      {showAbout && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in no-print">
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative">
            <button 
              onClick={() => setShowAbout(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={20} />
            </button>
            <div className="p-8 md:p-12 space-y-8">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
                  <Activity className="text-white" size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-black">{t.aboutTitle}</h2>
                  <p className="text-slate-500 font-medium text-sm">{t.subtitle}</p>
                </div>
              </div>
              
              <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500">{t.about}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {t.aboutDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500">{t.guideTitle}</h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li>{t.guideStep1}</li>
                    <li>{t.guideStep2}</li>
                    <li>{t.guideStep3}</li>
                    <li>{t.guideStep4}</li>
                    <li>{t.guideStep5}</li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500">{t.interpretationTitle}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {t.interpretationDesc}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500">{t.methodologyTitle}</h3>
                  <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {t.methodologyDescription}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-blue-500">{t.walkthroughTitle}</h3>
                  <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                    <li className="flex gap-2"><div className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" /> {t.walkthroughProcessing}</li>
                    <li className="flex gap-2"><div className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" /> {t.walkthroughKinetics}</li>
                    <li className="flex gap-2"><div className="mt-1.5 w-1 h-1 rounded-full bg-blue-500 shrink-0" /> {t.walkthroughWeibull}</li>
                  </ul>
                </div>

                <div className="grid grid-cols-2 gap-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.versionLabel}</h4>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">v2.6 Stable</p>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{t.developersLabel}</h4>
                    <p className="text-sm font-bold text-slate-800 dark:text-white">{t.developersContent}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={() => setShowAbout(false)}
                  className="w-full py-4 rounded-2xl bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
                >
                  {t.close}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6 no-print">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl shadow-xl shadow-blue-500/20">
              <Activity className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                {t.title} <span className="text-blue-500 text-sm font-medium border border-blue-500/30 px-2 py-0.5 rounded-full ml-2">v2.6</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">{t.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowGuide(!showGuide)}
              className={`p-3 rounded-2xl border transition-all active:scale-95 ${showGuide ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400 hover:text-blue-500'}`}
              title={t.guideTitle}
            >
              <HelpCircle size={20} />
            </button>
            <button 
              onClick={() => setShowAbout(true)}
              className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform active:scale-95 text-slate-400 hover:text-blue-500"
              title={t.about}
            >
              <Info size={20} />
            </button>
            <div className="flex bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
              {(['es', 'en', 'fr'] as Language[]).map(lang => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${language === lang ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  {lang.toUpperCase()}
                </button>
              ))}
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-transform active:scale-95">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={runSimulation} 
              disabled={isSimulating || hasErrors} 
              className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold text-white transition-all ${isSimulating || hasErrors ? 'bg-slate-400 cursor-not-allowed opacity-50' : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/30 active:scale-95'}`}
            >
              {isSimulating ? <RefreshCcw className="animate-spin" size={20} /> : <Play size={20} />}
              <span>{isSimulating ? t.simulating : t.runBtn}</span>
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-6 no-print">
            {/* Quick Guide */}
            {showGuide && (
              <div className="bg-blue-600 p-6 rounded-[2rem] shadow-xl shadow-blue-600/20 text-white space-y-4 animate-in relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12">
                  <HelpCircle size={80} />
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-black uppercase tracking-widest opacity-80 flex items-center gap-2">
                    <Info size={14} /> {t.guideTitle}
                  </h2>
                  <button onClick={() => setShowGuide(false)} className="opacity-60 hover:opacity-100 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
                <div className="space-y-3 relative z-10">
                  {[t.guideStep1, t.guideStep2, t.guideStep3, t.guideStep4].map((step, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="mt-1 bg-white/20 rounded-full p-0.5">
                        <Check size={10} />
                      </div>
                      <p className="text-[11px] font-medium leading-relaxed opacity-90">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Basic Config */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <SectionHeader title={t.baseConfig} icon={<ShoppingBag size={14} />} helpText={t.sectionHelpBase} />
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">{t.foodLabel}</label>
                    <select value={selectedFoodId} onChange={(e) => setSelectedFoodId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none text-slate-900 dark:text-slate-100">
                      {FOOD_PROFILES.map(f => <option key={f.id} value={f.id}>{FOOD_DATA[f.id as keyof typeof FOOD_DATA][language].name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">{t.pathogenLabel}</label>
                    <select value={selectedPathogenId} onChange={(e) => setSelectedPathogenId(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none text-slate-900 dark:text-slate-100">
                      {filteredPathogens.map(p => <option key={p.id} value={p.id}>{PATHOGEN_DATA[p.id as keyof typeof PATHOGEN_DATA][language].name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-tight flex items-center gap-2"><ShoppingBag size={14} /> {t.foodProfile}</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400">{FOOD_DATA[selectedFoodId as keyof typeof FOOD_DATA][language].desc}</p>
                </div>

                <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-800/30 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-tight flex items-center gap-2 text-blue-600"><ShieldAlert size={14} /> {t.pathogenInfo}</h3>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">{PATHOGEN_DATA[selectedPathogenId as keyof typeof PATHOGEN_DATA][language].desc}</p>
                  
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-blue-100/50 dark:border-blue-800/50 pb-2">
                    <ParamInput label={t.hospRateLabel} name="hospRate" value={params.hospRate} onChange={handleParamChange} step="0.01" tooltip={t.tooltips.sev} error={errors.hospRate} />
                    <ParamInput label={t.mortalityRateLabel} name="mortalityRate" value={params.mortalityRate} onChange={handleParamChange} step="0.001" tooltip={t.tooltips.dead} error={errors.mortalityRate} />
                    <div className="col-span-2">
                       <ParamInput label={t.absenceDaysLabel} name="absenceDays" value={params.absenceDays} onChange={handleParamChange} step="0.5" tooltip={t.tooltips.abs} error={errors.absenceDays} />
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-blue-100/50 dark:border-blue-800/50">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-500 uppercase">{t.doseResponseModel}</label>
                      <select 
                        name="doseResponseModel"
                        value={params.doseResponseModel} 
                        onChange={handleParamChange} 
                        className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs outline-none text-slate-900 dark:text-slate-100"
                      >
                        <option value={DoseResponseModel.BETA_POISSON}>{t.betaPoisson}</option>
                        <option value={DoseResponseModel.EXPONENTIAL}>{t.exponential}</option>
                        <option value={DoseResponseModel.LOG_LOGISTIC}>{t.logLogistic}</option>
                        <option value={DoseResponseModel.LOG_NORMAL}>{t.logNormal}</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {params.doseResponseModel === DoseResponseModel.BETA_POISSON && (
                        <>
                          <ParamInput label="Alpha (α)" name="alpha" value={params.alpha} onChange={handleParamChange} step="0.001" tooltip={t.tooltips.alpha} error={errors.alpha} />
                          <ParamInput label="Beta (β)" name="beta" value={params.beta} onChange={handleParamChange} step="1" tooltip={t.tooltips.beta} error={errors.beta} />
                        </>
                      )}
                      {params.doseResponseModel === DoseResponseModel.EXPONENTIAL && (
                        <div className="col-span-2">
                          <ParamInput label={t.kLabel} name="k" value={params.k} onChange={handleParamChange} step="0.0001" tooltip={t.tooltips.k} error={errors.k} />
                        </div>
                      )}
                      {params.doseResponseModel === DoseResponseModel.LOG_LOGISTIC && (
                        <>
                          <ParamInput label={t.d50Label} name="d50" value={params.d50} onChange={handleParamChange} step="1" tooltip={t.tooltips.d50} error={errors.d50} />
                          <ParamInput label="Beta (β)" name="beta" value={params.beta} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.beta} error={errors.beta} />
                        </>
                      )}
                      {params.doseResponseModel === DoseResponseModel.LOG_NORMAL && (
                        <>
                          <ParamInput label={t.d50Label} name="d50" value={params.d50} onChange={handleParamChange} step="1" tooltip={t.tooltips.d50} error={errors.d50} />
                          <ParamInput label={t.drSigmaLabel} name="drSigma" value={params.drSigma} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.drSigma} error={errors.drSigma} />
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <ParamInput label={t.exposedPop} name="populationSize" value={params.populationSize} onChange={handleParamChange} tooltip={t.tooltips.pop} icon={<Users size={12}/>} error={errors.populationSize} />
                  <ParamInput label={t.servingsYear} name="servingsPerYear" value={params.servingsPerYear} onChange={handleParamChange} tooltip={t.tooltips.serv} icon={<UtensilsCrossed size={12}/>} error={errors.servingsPerYear} />
                </div>
                <ParamInput label={t.iterations} name="iterations" value={params.iterations} onChange={handleParamChange} step="1000" min="100" tooltip={t.tooltips.iter} icon={<Sigma size={12}/>} error={errors.iterations} />
              </div>
            </div>

            {/* Economic Config */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <SectionHeader title={t.econParamsTitle} icon={<Banknote size={14} />} helpText={t.sectionHelpEcon} />
              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                <ParamInput label={t.costHospLabel} name="costHosp" value={params.costHosp} onChange={handleParamChange} step="100" tooltip={t.tooltips.costHosp} icon={<Factory size={12}/>} error={errors.costHosp} />
                <ParamInput label={t.costAmbLabel} name="costAmb" value={params.costAmb} onChange={handleParamChange} step="50" tooltip={t.tooltips.costAmb} icon={<UtensilsCrossed size={12}/>} error={errors.costAmb} />
                <ParamInput label={t.costAbsenceLabel} name="costAbsence" value={params.costAbsence} onChange={handleParamChange} step="10" tooltip={t.tooltips.costAbsence} icon={<Clock size={12}/>} error={errors.costAbsence} />
                <ParamInput label={t.costDeathLabel} name="costDeath" value={params.costDeath} onChange={handleParamChange} step="10000" tooltip={t.tooltips.costDeath} icon={<Scale size={12}/>} error={errors.costDeath} />
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
              <SectionHeader title={t.exposureStages} icon={<Flame size={14} />} helpText={t.sectionHelpExposure} />
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                  <ParamInput label={t.prevalence} name="prevalence" value={params.prevalence} onChange={handleParamChange} step="0.01" tooltip={t.tooltips.prev} error={errors.prevalence} />
                  <div className="grid grid-cols-2 gap-4">
                    <ParamInput label={t.initialLoad} name="initialLogMean" value={params.initialLogMean} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.load} error={errors.initialLogMean} />
                    <ParamInput label={`${t.initialLoad} (${t.stdDev})`} name="initialLogStd" value={params.initialLogStd} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.load} error={errors.initialLogStd} />
                  </div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-2xl">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-3">{t.logChanges}</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                    <ParamInput label={t.process} name="processingDeltaLog" value={params.processingDeltaLog} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.processing} error={errors.processingDeltaLog} />
                    <ParamInput label={t.transport} name="transportDeltaLog" value={params.transportDeltaLog} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.transport} error={errors.transportDeltaLog} />
                    <ParamInput label={t.retail} name="distributionDeltaLog" value={params.distributionDeltaLog} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.retail} error={errors.distributionDeltaLog} />
                    <ParamInput label={t.prep} name="preparationDeltaLog" value={params.preparationDeltaLog} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.prep} error={errors.preparationDeltaLog} />
                  </div>
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-3">{t.kinetics}</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                    <ParamInput label={t.growthRate} name="growthRate" value={params.growthRate} onChange={handleParamChange} step="0.01" tooltip={t.tooltips.growthRate} error={errors.growthRate} />
                    <ParamInput label={`${t.growthRate} (${t.stdDev})`} name="growthRateStd" value={params.growthRateStd} onChange={handleParamChange} step="0.01" tooltip={t.tooltips.growthRate} error={errors.growthRateStd} />
                    <ParamInput label={t.growthTime} name="growthTime" value={params.growthTime} onChange={handleParamChange} step="1" tooltip={t.tooltips.growthTime} error={errors.growthTime} />
                  </div>
                </div>
                <div className="p-3 border-t border-slate-100 dark:border-slate-800">
                  <p className="text-[9px] font-bold text-slate-400 uppercase mb-3">{t.inactivationTitle}</p>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-5">
                    <ParamInput label="Delta" name="delta" value={params.delta} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.delta} error={errors.delta} />
                    <ParamInput label={`Delta (${t.stdDev})`} name="deltaStd" value={params.deltaStd} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.delta} error={errors.deltaStd} />
                    <ParamInput label="P" name="p" value={params.p} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.p} error={errors.p} />
                    <ParamInput label={`P (${t.stdDev})`} name="pStd" value={params.pStd} onChange={handleParamChange} step="0.1" tooltip={t.tooltips.p} error={errors.pStd} />
                    <ParamInput label="Time" name="inactivationTime" value={params.inactivationTime} onChange={handleParamChange} step="1" tooltip={t.tooltips.inact} error={errors.inactivationTime} />
                  </div>
                </div>
              </div>
            </div>
          </aside>

          <main className="lg:col-span-8 space-y-8 pb-12" ref={resultsRef}>
            {!results ? (
              <div className="bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] h-full min-h-[500px] flex flex-col items-center justify-center text-center p-12 text-slate-400">
                <BarChart3 size={64} className="mb-4 opacity-20" />
                <p className="font-bold">{t.emptyResults}</p>
                <p className="text-xs max-w-xs mt-2 opacity-60">{t.emptySub}</p>
              </div>
            ) : (
              <div className="space-y-8 animate-in">
                <div className="flex items-center justify-end gap-3 no-print">
                   <button onClick={saveSimulation} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase text-blue-600 hover:bg-blue-50 transition-all border border-blue-200">
                     <Activity size={14} /> {t.saveRun}
                   </button>
                   <button onClick={generateShareUrl} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase transition-all border ${copySuccess ? 'bg-emerald-50 text-emerald-500 border-emerald-200' : 'text-slate-500 hover:text-blue-500 hover:bg-blue-50 border-slate-200'}`}>
                     {copySuccess ? <Check size={14} /> : <Share2 size={14} />} {copySuccess ? t.linkCopied : t.share}
                   </button>
                   <button onClick={clearResults} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase text-slate-500 hover:text-red-500 transition-all border border-slate-200">
                     <Trash2 size={14} /> {t.clear}
                   </button>
                   <button onClick={exportPDF} className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase text-white bg-slate-800 shadow-lg">
                     <FileDown size={14} /> {t.pdf}
                   </button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: t.infections, val: Math.round(results.summary.infected), color: 'slate', icon: <Users size={16}/>, tip: t.tooltips.inf },
                    { label: t.severe, val: Math.round(results.summary.hospitalized), color: 'orange', icon: <HeartPulse size={16}/>, tip: t.tooltips.sev },
                    { label: t.deaths, val: Math.round(results.summary.deaths), color: 'red', icon: <Scale size={16}/>, tip: t.tooltips.dead },
                    { 
                      label: t.fatalityRate, 
                      val: results.summary.infected > 0 ? ((results.summary.deaths / results.summary.infected) * 100).toFixed(2) + '%' : '0%', 
                      color: 'rose', 
                      icon: <ShieldAlert size={16}/>, 
                      tip: t.tooltips.fatality 
                    },
                    { label: t.absence, val: Math.round(results.summary.absence), color: 'emerald', icon: <TrendingUp size={16}/>, tip: t.tooltips.abs }
                  ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform">{stat.icon}</div>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[11px] font-bold text-${stat.color === 'slate' ? 'slate' : stat.color}-500 uppercase tracking-widest block`}>{stat.label}</span>
                        <InfoTooltip text={stat.tip} />
                      </div>
                      <div className="text-3xl font-black">{stat.val.toLocaleString()}</div>
                      <div className="text-[9px] text-slate-400 mt-1 uppercase font-bold italic">{t.avgEst}</div>
                    </div>
                  ))}
                </div>

                {/* Results Insight Panel */}
                <div className="bg-blue-600 p-8 rounded-[3rem] shadow-xl shadow-blue-600/20 text-white space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 -rotate-12">
                    <Activity size={120} />
                  </div>
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="text-lg font-extrabold flex items-center gap-3">
                      <Zap size={20} /> {t.insightTitle}
                    </h3>
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1 rounded-full">
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t.riskLevel}:</span>
                      <span className={`text-xs font-black uppercase ${results.summary.annualCases > 1000 ? 'text-red-300' : results.summary.annualCases > 100 ? 'text-orange-300' : 'text-emerald-300'}`}>
                        {results.summary.annualCases > 1000 ? t.highRisk : results.summary.annualCases > 100 ? t.medRisk : t.lowRisk}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed opacity-90 relative z-10 max-w-2xl">
                    {t.insightDesc
                      .replace('{focus}', economicSummary && economicSummary.externalidades > economicSummary.sanitarios ? t.deaths.toLowerCase() : t.sanitaryCosts.toLowerCase())
                      .replace('{stage}', results.stageProgression.reduce((prev, curr) => curr.value > prev.value ? curr : prev).name)
                    }
                  </p>
                  <div className="pt-2 flex items-center gap-2 relative z-10">
                    <Info size={14} className="opacity-60" />
                    <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{t.interpretationGuide}</p>
                    <InfoTooltip text={t.interpretationDesc} />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-8">
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                    <h3 className="text-[11px] font-black text-orange-500 uppercase tracking-widest mb-8 flex items-center gap-2"><Sigma size={16}/> {t.caseDist}</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer>
                        <BarChart data={results.histogram}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" fontSize={9} />
                          <YAxis fontSize={9} label={{ value: t.countLabel, angle: -90, position: 'insideLeft', fontSize: 10 }} />
                          <Tooltip content={<CustomTooltip />} />
                          <Bar dataKey="value" name={t.countLabel} fill="#f97316" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                {/* Combined Weibull Inactivation Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-xl">
                        <Flame size={20} className="text-blue-500" />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-widest">{t.inactivationProfile}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{t.inactivationDetailTitle}</p>
                      </div>
                    </div>
                    <InfoTooltip text={t.tooltips.inact} />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-7 space-y-6">
                      <div className="h-72 w-full bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl p-4">
                        <ResponsiveContainer>
                          <LineChart data={weibullInactivationData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="time" fontSize={9} label={{ value: t.timeMin, position: 'bottom', fontSize: 10 }} />
                            <YAxis fontSize={9} label={{ value: t.reductionLog, angle: -90, position: 'insideLeft', fontSize: 10 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Line type="monotone" dataKey="reduction" stroke="#3b82f6" strokeWidth={4} dot={false} animationDuration={1500} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-2xl border border-blue-100 dark:border-blue-900/30">
                        <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed italic">
                          <Info size={12} className="inline mr-1 mb-0.5" />
                          {t.walkthroughWeibull}
                        </p>
                      </div>
                    </div>

                    <div className="xl:col-span-5 space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Calculator size={12} /> {t.formulaTitle}
                        </h4>
                        <div className="font-serif text-xl text-center py-4 text-slate-700 dark:text-slate-300">
                          Log<sub>10</sub>(N/N<sub>0</sub>) = -(t/&delta;)<sup>p</sup>
                        </div>
                        <div className="mt-4 grid grid-cols-3 gap-2 text-center border-t border-slate-100 dark:border-slate-700 pt-4">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">&delta; (Delta)</p>
                            <p className="text-sm font-black text-blue-600">{params.delta}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">p (Shape)</p>
                            <p className="text-sm font-black text-blue-600">{params.p}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">t (Total)</p>
                            <p className="text-sm font-black text-blue-600">{params.inactivationTime}m</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-600 p-6 rounded-3xl shadow-lg shadow-blue-600/20 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12"><Flame size={48} /></div>
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-80">{t.totalReduction}</p>
                        <div className="flex items-baseline gap-2">
                          <p className="text-4xl font-black mt-1">
                            {Math.pow(params.inactivationTime / params.delta, params.p).toFixed(3)}
                          </p>
                          <span className="text-xs font-bold opacity-70">Log<sub>10</sub></span>
                        </div>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/20 rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                          <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-100/30 dark:bg-slate-800/30">
                            <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                              <Calculator size={10} /> {t.inactivationDetailTitle}
                            </h5>
                          </div>
                          <table className="w-full text-[10px]">
                            <thead>
                              <tr className="text-left text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                <th className="px-4 py-2">{t.timeMin}</th>
                                <th className="px-4 py-2 text-right">{t.intermediateValue}</th>
                                <th className="px-4 py-2 text-right">{t.reductionLog}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                              {weibullTableData.map((row, idx) => (
                                <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-700/20 transition-colors">
                                  <td className="px-4 py-2 font-mono text-slate-500">{row.t.toFixed(1)}</td>
                                  <td className="px-4 py-2 text-right font-mono text-slate-400">{row.intermediate.toFixed(3)}</td>
                                  <td className="px-4 py-2 text-right font-black text-blue-600 dark:text-blue-400">{row.logReduction.toFixed(3)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Dose-Response Section */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded-xl">
                        <MicroscopeIcon size={20} className="text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-[11px] font-black text-emerald-500 uppercase tracking-widest">{t.doseResponseTitle}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Beta-Poisson Model</p>
                      </div>
                    </div>
                    <InfoTooltip text={t.tooltips.doseResponse} />
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                    <div className="xl:col-span-8">
                      <div className="h-72 w-full bg-slate-50/50 dark:bg-slate-800/20 rounded-3xl p-4">
                        <ResponsiveContainer>
                          <LineChart data={doseResponseData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis 
                              dataKey="logDose" 
                              fontSize={9} 
                              label={{ value: 'Log10 Dose (CFU)', position: 'bottom', fontSize: 10, offset: 0 }} 
                            />
                            <YAxis 
                              fontSize={9} 
                              domain={[0, 1]} 
                              label={{ value: t.probIllnessLabel, angle: -90, position: 'insideLeft', fontSize: 10 }} 
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line 
                              type="monotone" 
                              dataKey="prob" 
                              name={t.probIllnessLabel}
                              stroke="#10b981" 
                              strokeWidth={4} 
                              dot={false} 
                              animationDuration={1500}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="xl:col-span-4 space-y-6">
                      <div className="bg-slate-50 dark:bg-slate-800/40 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Sigma size={12} /> {t.formulaTitle}
                        </h4>
                        <div className="font-serif text-lg text-center py-4 text-slate-700 dark:text-slate-300">
                          P<sub>inf</sub> = 1 - (1 + d/&beta;)<sup>-&alpha;</sup>
                        </div>
                        <div className="mt-4 grid grid-cols-2 gap-4 text-center border-t border-slate-100 dark:border-slate-700 pt-4">
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">&alpha; (Alpha)</p>
                            <p className="text-sm font-black text-emerald-600">{params.alpha}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 font-bold uppercase">&beta; (Beta)</p>
                            <p className="text-sm font-black text-emerald-600">{params.beta.toExponential(2)}</p>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                        <div className="flex gap-3">
                          <Info size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">{t.modelInsightTitle}</p>
                            <p className="text-[10px] text-emerald-600 dark:text-emerald-300 leading-relaxed italic">
                              {t.modelInsightDesc}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sensitivity Analysis - Tornado Chart */}
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[11px] font-black text-violet-500 uppercase tracking-widest flex items-center gap-2"><Zap size={16}/> {t.sensitivityTitle}</h3>
                    <InfoTooltip text={t.tooltips.sensitivity} />
                  </div>
                  <div className="h-72 w-full">
                    <ResponsiveContainer>
                      <BarChart 
                        data={results.sensitivity} 
                        layout="vertical"
                        margin={{ left: 40, right: 40 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                        <XAxis type="number" fontSize={9} unit="%" />
                        <YAxis dataKey="name" type="category" fontSize={9} width={80} axisLine={false} tickLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
                          {results.sensitivity.map((entry, index) => (
                            <Cell key={index} fill={entry.impact > 0 ? '#8b5cf6' : '#ec4899'} />
                          ))}
                        </Bar>
                        <ReferenceLine x={0} stroke="#cbd5e1" strokeWidth={2} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 text-[10px] text-slate-400 font-medium italic text-center uppercase tracking-wider">{t.impactPercent}</div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <h3 className="text-lg font-extrabold flex items-center gap-3 mb-8"><DollarSign className="text-emerald-500" /> {t.econTitle}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.sanitaryCosts}</p>
                        <InfoTooltip text={t.tooltips.econHosp} />
                      </div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">${formatEconomicValue(economicSummary?.sanitarios)}</p>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium italic">{t.sanitaryDesc}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-3xl border border-slate-100 dark:border-slate-700">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.prodCosts}</p>
                        <InfoTooltip text={t.tooltips.econProd} />
                      </div>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">${formatEconomicValue(economicSummary?.productividad)}</p>
                      <p className="text-[10px] text-slate-500 mt-2 font-medium italic">{t.prodDesc}</p>
                    </div>
                    <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-800/30 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{t.socialImpact}</p>
                        <InfoTooltip text={t.tooltips.econSocial} />
                      </div>
                      <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">${formatEconomicValue(economicSummary?.total)}</p>
                      <p className="text-[10px] text-emerald-700/70 dark:text-emerald-400/70 mt-2 font-medium italic">{t.socialImpactDesc}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-[11px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2"><TrendingUp size={16}/> {t.progressionTitle}</h3>
                    <InfoTooltip text={t.tooltips.prog} />
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer>
                      <AreaChart data={results.stageProgression}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                        <YAxis fontSize={10} axisLine={false} tickLine={false} label={{ value: t.logLoadLabel, angle: -90, position: 'insideLeft', fontSize: 10 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="value" name={t.logLoadLabel} stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={4} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Comparison Dashboard */}
                {savedSimulations.length > 0 && (
                  <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-sm space-y-8 no-print">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-extrabold flex items-center gap-3">
                        <BarChart3 className="text-blue-500" /> {t.comparisonTitle}
                      </h3>
                      <div className="flex items-center gap-4">
                        {selectedSimIds.length >= 2 && (
                          <button 
                            onClick={() => setShowComparisonModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold uppercase text-white bg-blue-600 shadow-lg hover:scale-105 transition-all"
                          >
                            <Scale size={14} /> {t.compareSelected}
                          </button>
                        )}
                        <button 
                          onClick={clearSavedSimulations}
                          className="text-[10px] font-bold uppercase text-slate-400 hover:text-red-500 transition-colors"
                        >
                          {t.clearSaved}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.savedRuns}</p>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                          {savedSimulations.map((sim) => (
                            <div key={sim.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all group ${selectedSimIds.includes(sim.id) ? 'bg-blue-50/50 border-blue-200 dark:bg-blue-900/10 dark:border-blue-800' : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'}`}>
                              <div className="flex items-center gap-4">
                                <input 
                                  type="checkbox" 
                                  checked={selectedSimIds.includes(sim.id)}
                                  onChange={() => toggleSimulationSelection(sim.id)}
                                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <div className="bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm">
                                  <Activity size={16} className="text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold">{sim.pathogenName} in {sim.foodName}</p>
                                  <p className="text-[9px] text-slate-400">{new Date(sim.timestamp).toLocaleString()}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-[10px] font-black text-emerald-600">${formatEconomicValue(sim.results.summary.ill * sim.params.servingsPerYear * sim.params.costAmb + sim.results.summary.hospitalized * sim.params.servingsPerYear * sim.params.costHosp + sim.results.summary.absence * sim.params.servingsPerYear * sim.params.costAbsence + sim.results.summary.deaths * sim.params.servingsPerYear * sim.params.costDeath)}</p>
                                  <p className="text-[8px] text-slate-400 uppercase font-bold">{t.socialImpact}</p>
                                </div>
                                <button 
                                  onClick={() => loadSavedSimulation(sim)}
                                  className="p-2 text-slate-300 hover:text-blue-500 transition-colors opacity-0 group-hover:opacity-100"
                                  title={t.load}
                                >
                                  <RefreshCcw size={14} />
                                </button>
                                <button 
                                  onClick={() => removeSavedSimulation(sim.id)}
                                  className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                  title={t.remove}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-6">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.compareSocialImpact}</p>
                        <div className="h-64 w-full">
                          <ResponsiveContainer>
                            <BarChart data={savedSimulations.map((s, i) => ({
                              name: `${s.pathogenName.split(' ')[0]} #${savedSimulations.length - i}`,
                              impact: s.results.summary.ill * s.params.servingsPerYear * s.params.costAmb + s.results.summary.hospitalized * s.params.servingsPerYear * s.params.costHosp + s.results.summary.absence * s.params.servingsPerYear * s.params.costAbsence + s.results.summary.deaths * s.params.servingsPerYear * s.params.costDeath
                            })).reverse()}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" fontSize={9} />
                              <YAxis fontSize={9} label={{ value: 'USD', angle: -90, position: 'insideLeft', fontSize: 10 }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="impact" name={t.socialImpact} fill="#3b82f6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
      <footer className="max-w-7xl mx-auto mt-12 pb-8 text-center border-t border-slate-200 dark:border-slate-800 pt-8 no-print">
        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest flex items-center justify-center gap-2">ProbRisk QMRA <Activity size={10} /> 2025 • High-Resolution Analytics</p>
      </footer>

      <ComparisonModal 
        isOpen={showComparisonModal}
        onClose={() => setShowComparisonModal(false)}
        selectedSims={savedSimulations.filter(s => selectedSimIds.includes(s.id))}
        t={t}
        language={language}
      />
    </div>
  );
};

export default App;
