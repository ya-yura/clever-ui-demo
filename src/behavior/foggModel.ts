// === 📁 src/behavior/foggModel.ts ===
// Fogg Behavior Model implementation for warehouse operations
// B = MAT (Behavior = Motivation × Ability × Trigger)

/**
 * Motivation levels
 */
export type MotivationLevel = 'low' | 'medium' | 'high';

/**
 * Ability (ease of use) levels
 */
export type AbilityLevel = 'hard' | 'medium' | 'easy';

/**
 * Trigger types
 */
export type TriggerType = 
  | 'spark'       // Motivates behavior (for low motivation)
  | 'facilitator' // Makes behavior easier (for low ability)
  | 'signal';     // Reminds to do behavior (for high motivation + high ability)

/**
 * Behavior factors
 */
export interface BehaviorFactors {
  motivation: MotivationLevel;
  ability: AbilityLevel;
  trigger?: TriggerType;
}

/**
 * Calculate if behavior will occur
 */
export function willBehaviorOccur(factors: BehaviorFactors): boolean {
  const motivationScore = getMotivationScore(factors.motivation);
  const abilityScore = getAbilityScore(factors.ability);
  
  // Behavior occurs if motivation × ability crosses threshold and trigger is present
  const behaviorScore = motivationScore * abilityScore;
  const threshold = 0.5;
  
  return behaviorScore >= threshold && factors.trigger !== undefined;
}

/**
 * Get appropriate trigger for current state
 */
export function getAppropiateTrigger(
  motivation: MotivationLevel,
  ability: AbilityLevel
): TriggerType {
  const motivationScore = getMotivationScore(motivation);
  const abilityScore = getAbilityScore(ability);
  
  // Low motivation → need spark
  if (motivationScore < 0.4) {
    return 'spark';
  }
  
  // Low ability → need facilitator
  if (abilityScore < 0.4) {
    return 'facilitator';
  }
  
  // High motivation + high ability → just signal
  return 'signal';
}

/**
 * Strategies to increase motivation
 */
export const MOTIVATION_STRATEGIES = {
  // Pleasure/Pain
  immediateReward: {
    name: 'Immediate Reward',
    description: 'Show progress immediately after action',
    examples: [
      'Green checkmark animation',
      'Progress bar increment',
      'Success sound',
    ],
  },
  
  // Hope/Fear
  futureOutcome: {
    name: 'Future Outcome',
    description: 'Show what will happen if action is completed/not completed',
    examples: [
      '"Осталось 2 позиции до завершения"',
      '"Через 5 минут закончите смену вовремя"',
      'Visual countdown timer',
    ],
  },
  
  // Social Acceptance/Rejection
  socialProof: {
    name: 'Social Proof',
    description: 'Show that others are doing this behavior',
    examples: [
      '"Ваш напарник завершил свою часть"',
      'Team leaderboard',
      'Peer comparison',
    ],
  },
};

/**
 * Strategies to increase ability (reduce friction)
 */
export const ABILITY_STRATEGIES = {
  // Time
  reduceTime: {
    name: 'Reduce Time',
    description: 'Make action faster to complete',
    examples: [
      'Auto-scan instead of manual input',
      'Default values pre-filled',
      'One-tap actions',
    ],
  },
  
  // Money
  reduceCost: {
    name: 'Reduce Cost',
    description: 'Lower perceived cost of action',
    examples: [
      'Undo button (reduces fear of mistakes)',
      'Auto-save (no need to remember)',
    ],
  },
  
  // Physical Effort
  reduceEffort: {
    name: 'Reduce Physical Effort',
    description: 'Make action physically easier',
    examples: [
      'Larger tap targets',
      'Swipe instead of multiple taps',
      'Voice input option',
    ],
  },
  
  // Brain Cycles
  reduceCognitive: {
    name: 'Reduce Cognitive Load',
    description: 'Make action mentally easier',
    examples: [
      'Cards instead of tables',
      'Visual indicators instead of text',
      'Smart defaults',
      'Hide complexity',
    ],
  },
  
  // Social Deviance
  reduceDeviance: {
    name: 'Reduce Social Deviance',
    description: 'Make action socially acceptable',
    examples: [
      'Show that others do this',
      'Make it standard practice',
    ],
  },
  
  // Non-Routine
  makeRoutine: {
    name: 'Make Routine',
    description: 'Turn into habit through repetition',
    examples: [
      'Consistent flow',
      'Same location for actions',
      'Visual anchors',
    ],
  },
};

/**
 * Trigger strategies
 */
export const TRIGGER_STRATEGIES = {
  spark: {
    name: 'Spark (Motivate)',
    description: 'For users with ability but lacking motivation',
    examples: [
      '"Отлично! Ещё 2 позиции"',
      'Progress celebration',
      'Gamification elements',
    ],
  },
  
  facilitator: {
    name: 'Facilitator (Enable)',
    description: 'For users with motivation but lacking ability',
    examples: [
      '"Совет: используйте свайп для быстрого добавления"',
      'Onboarding tooltips',
      'Inline help',
    ],
  },
  
  signal: {
    name: 'Signal (Remind)',
    description: 'For users with both motivation and ability',
    examples: [
      '"Сканируйте следующий товар"',
      'Simple prompts',
      'Visual cues',
    ],
  },
};

// Helper functions

function getMotivationScore(level: MotivationLevel): number {
  switch (level) {
    case 'high': return 0.9;
    case 'medium': return 0.6;
    case 'low': return 0.3;
  }
}

function getAbilityScore(level: AbilityLevel): number {
  switch (level) {
    case 'easy': return 0.9;
    case 'medium': return 0.6;
    case 'hard': return 0.3;
  }
}


