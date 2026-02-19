import type { Audit, Question } from '../types/audit.types';

export const scoringEngine = {
  calculateScore(audit: Audit, questions: Question[]): number {
    if (!questions.length) return 0;

    const totalWeight = questions.reduce((acc, q) => acc + q.weight, 0);
    if (totalWeight === 0) return 0;

    const obtainedWeight = questions.reduce((acc, q) => {
      const found = audit.responses.find((r) => r.questionId === q.id);
      if (found?.response === 'Yes') return acc + q.weight;
      if (found?.response === 'NA') return acc + q.weight * 0.5;
      return acc;
    }, 0);

    return Math.round((obtainedWeight / totalWeight) * 100);
  }
};

// TODO(Phase 2): Add configurable scoring profiles and server-side validation.
