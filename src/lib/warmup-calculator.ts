export interface WarmupSet {
  weight: number;
  reps: number;
  label: string;
}

export function calculateWarmupSets(workingWeight: number): WarmupSet[] {
  if (workingWeight <= 45) return [];

  const sets: WarmupSet[] = [];

  // Empty bar
  sets.push({ weight: 45, reps: 10, label: 'Bar' });

  const percentages = [0.5, 0.7, 0.85];
  const repsAtPercent = [8, 5, 3];

  for (let i = 0; i < percentages.length; i++) {
    const rawWeight = workingWeight * percentages[i];
    // Round to nearest 5
    const weight = Math.round(rawWeight / 5) * 5;

    if (weight > 45 && weight < workingWeight) {
      sets.push({
        weight,
        reps: repsAtPercent[i],
        label: `${Math.round(percentages[i] * 100)}%`,
      });
    }
  }

  return sets;
}
