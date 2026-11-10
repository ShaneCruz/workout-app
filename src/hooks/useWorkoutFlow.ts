'use client';

import { useState, useCallback, useMemo } from 'react';
import { ExerciseGroupRow, ExerciseRow } from '@/lib/db/plans';

export interface WorkoutPosition {
  groupIndex: number;
  roundIndex: number;
  exerciseIndex: number;
  side: 'left' | 'right' | null;
  setNumber: number;
}

interface SetLog {
  exerciseId: string;
  setNumber: number;
  side: 'left' | 'right' | null;
}

export interface WorkoutFlowState {
  position: WorkoutPosition;
  isResting: boolean;
  isComplete: boolean;
  selectedOptions: Record<string, string>; // optionGroup -> exerciseId
  completedSets: SetLog[];
  skippedGroups: Set<number>;
}

export function useWorkoutFlow(groups: ExerciseGroupRow[]) {
  const [state, setState] = useState<WorkoutFlowState>({
    position: { groupIndex: 0, roundIndex: 0, exerciseIndex: 0, side: null, setNumber: 1 },
    isResting: false,
    isComplete: false,
    selectedOptions: {},
    completedSets: [],
    skippedGroups: new Set(),
  });

  const currentGroup = groups[state.position.groupIndex] as ExerciseGroupRow | undefined;

  // Filter exercises based on selected options
  const activeExercises = useMemo(() => {
    if (!currentGroup) return [];
    const exercises = currentGroup.exercises;

    // Group exercises by option_group
    const optionGroups = new Map<string, ExerciseRow[]>();
    const noOption: ExerciseRow[] = [];

    for (const ex of exercises) {
      if (ex.option_group) {
        const list = optionGroups.get(ex.option_group) ?? [];
        list.push(ex);
        optionGroups.set(ex.option_group, list);
      } else {
        noOption.push(ex);
      }
    }

    // If there are option groups that haven't been selected yet, return all
    for (const [og] of optionGroups) {
      if (!state.selectedOptions[og]) {
        return exercises; // Show all so OptionPicker can be rendered
      }
    }

    // Filter to selected options
    const result = [...noOption];
    for (const [og, exs] of optionGroups) {
      const selectedId = state.selectedOptions[og];
      const selected = exs.find(e => e.id === selectedId);
      if (selected) result.push(selected);
    }

    return result.sort((a, b) => a.sort_order - b.sort_order);
  }, [currentGroup, state.selectedOptions]);

  const currentExercise = activeExercises[state.position.exerciseIndex] as ExerciseRow | undefined;

  // Check if current group has unselected options
  const pendingOptionGroup = useMemo(() => {
    if (!currentGroup) return null;
    for (const ex of currentGroup.exercises) {
      if (ex.option_group && !state.selectedOptions[ex.option_group]) {
        return ex.option_group;
      }
    }
    return null;
  }, [currentGroup, state.selectedOptions]);

  const optionsForGroup = useMemo(() => {
    if (!pendingOptionGroup || !currentGroup) return [];
    return currentGroup.exercises.filter(e => e.option_group === pendingOptionGroup);
  }, [pendingOptionGroup, currentGroup]);

  // Determine the initial side for per-side exercises
  const getInitialSide = useCallback((exercise: ExerciseRow | undefined): 'left' | 'right' | null => {
    if (!exercise || !exercise.per_side) return null;
    return 'left';
  }, []);

  const selectOption = useCallback((optionGroup: string, exerciseId: string) => {
    setState(prev => ({
      ...prev,
      selectedOptions: { ...prev.selectedOptions, [optionGroup]: exerciseId },
    }));
  }, []);

  const skipGroup = useCallback(() => {
    setState(prev => {
      const newSkipped = new Set(prev.skippedGroups);
      newSkipped.add(prev.position.groupIndex);

      let nextGroupIndex = prev.position.groupIndex + 1;
      while (nextGroupIndex < groups.length && newSkipped.has(nextGroupIndex)) {
        nextGroupIndex++;
      }

      if (nextGroupIndex >= groups.length) {
        return { ...prev, isComplete: true, skippedGroups: newSkipped };
      }

      const nextExercise = groups[nextGroupIndex]?.exercises[0];
      return {
        ...prev,
        skippedGroups: newSkipped,
        position: {
          groupIndex: nextGroupIndex,
          roundIndex: 0,
          exerciseIndex: 0,
          side: getInitialSide(nextExercise),
          setNumber: 1,
        },
      };
    });
  }, [groups, getInitialSide]);

  const logSetAndAdvance = useCallback(() => {
    setState(prev => {
      if (!currentGroup || !currentExercise) return prev;

      const newLog: SetLog = {
        exerciseId: currentExercise.id,
        setNumber: prev.position.setNumber,
        side: prev.position.side,
      };

      const newCompletedSets = [...prev.completedSets, newLog];
      const pos = { ...prev.position };

      // If per-side and on left, switch to right
      if (currentExercise.per_side && pos.side === 'left') {
        return {
          ...prev,
          completedSets: newCompletedSets,
          position: { ...pos, side: 'right' },
        };
      }

      // Move to next exercise in group (for supersets/trisets/circuits)
      const nextExerciseIndex = pos.exerciseIndex + 1;
      if (nextExerciseIndex < activeExercises.length) {
        const nextEx = activeExercises[nextExerciseIndex];
        return {
          ...prev,
          completedSets: newCompletedSets,
          position: {
            ...pos,
            exerciseIndex: nextExerciseIndex,
            side: getInitialSide(nextEx),
            setNumber: prev.completedSets.filter(
              s => s.exerciseId === nextEx.id && s.side !== 'right'
            ).length + 1,
          },
        };
      }

      // Completed all exercises in this round
      const nextRound = pos.roundIndex + 1;
      if (nextRound < currentGroup.rounds) {
        // More rounds — trigger rest timer first
        const firstEx = activeExercises[0];
        return {
          ...prev,
          completedSets: newCompletedSets,
          isResting: currentGroup.rest_seconds > 0,
          position: {
            groupIndex: pos.groupIndex,
            roundIndex: nextRound,
            exerciseIndex: 0,
            side: getInitialSide(firstEx),
            setNumber: newCompletedSets.filter(
              s => s.exerciseId === firstEx?.id && s.side !== 'right'
            ).length + 1,
          },
        };
      }

      // Completed all rounds — move to next group
      let nextGroupIndex = pos.groupIndex + 1;
      while (nextGroupIndex < groups.length && prev.skippedGroups.has(nextGroupIndex)) {
        nextGroupIndex++;
      }

      if (nextGroupIndex >= groups.length) {
        return { ...prev, completedSets: newCompletedSets, isComplete: true };
      }

      const nextGroupExercise = groups[nextGroupIndex]?.exercises[0];
      return {
        ...prev,
        completedSets: newCompletedSets,
        isResting: currentGroup.rest_seconds > 0,
        position: {
          groupIndex: nextGroupIndex,
          roundIndex: 0,
          exerciseIndex: 0,
          side: getInitialSide(nextGroupExercise),
          setNumber: 1,
        },
      };
    });
  }, [currentGroup, currentExercise, activeExercises, groups, getInitialSide]);

  const restComplete = useCallback(() => {
    setState(prev => ({ ...prev, isResting: false }));
  }, []);

  const canGoBack = state.position.groupIndex > 0
    || state.position.roundIndex > 0
    || state.position.exerciseIndex > 0
    || state.position.side === 'right';

  const goBack = useCallback(() => {
    setState(prev => {
      const pos = prev.position;

      // If on right side, go back to left
      if (pos.side === 'right') {
        return {
          ...prev,
          position: { ...pos, side: 'left' },
          completedSets: prev.completedSets.slice(0, -1),
        };
      }

      // Get the exercises for the current group
      const currentGroupExercises = groups[pos.groupIndex]?.exercises ?? [];

      // Go to previous exercise within current group
      if (pos.exerciseIndex > 0) {
        const prevEx = currentGroupExercises[pos.exerciseIndex - 1];
        return {
          ...prev,
          position: {
            ...pos,
            exerciseIndex: pos.exerciseIndex - 1,
            side: prevEx?.per_side ? 'right' : null,
            setNumber: Math.max(1, pos.setNumber - 1),
          },
          completedSets: prev.completedSets.slice(0, -1),
        };
      }

      // Go to previous round (last exercise of same group)
      if (pos.roundIndex > 0) {
        const lastExIndex = currentGroupExercises.length - 1;
        const lastEx = currentGroupExercises[lastExIndex];
        return {
          ...prev,
          position: {
            ...pos,
            roundIndex: pos.roundIndex - 1,
            exerciseIndex: lastExIndex,
            side: lastEx?.per_side ? 'right' : null,
            setNumber: Math.max(1, pos.setNumber - 1),
          },
          completedSets: prev.completedSets.slice(0, -1),
        };
      }

      // Go to previous group (last round, last exercise)
      if (pos.groupIndex > 0) {
        const prevGroup = groups[pos.groupIndex - 1];
        const prevGroupExercises = prevGroup?.exercises ?? [];
        const lastExIndex = prevGroupExercises.length - 1;
        const lastEx = prevGroupExercises[lastExIndex];
        return {
          ...prev,
          position: {
            groupIndex: pos.groupIndex - 1,
            roundIndex: (prevGroup?.rounds ?? 1) - 1,
            exerciseIndex: lastExIndex,
            side: lastEx?.per_side ? 'right' : null,
            setNumber: Math.max(1, prev.completedSets.length),
          },
          completedSets: prev.completedSets.slice(0, -1),
        };
      }

      return prev;
    });
  }, [groups]);

  const totalSets = useMemo(() => {
    let count = 0;
    for (const group of groups) {
      const exerciseCount = group.exercises.length;
      count += exerciseCount * group.rounds;
    }
    return count;
  }, [groups]);

  return {
    state,
    currentGroup,
    currentExercise,
    activeExercises,
    pendingOptionGroup,
    optionsForGroup,
    totalSets,
    completedSetCount: state.completedSets.length,
    logSetAndAdvance,
    restComplete,
    selectOption,
    skipGroup,
    goBack,
    canGoBack,
  };
}
