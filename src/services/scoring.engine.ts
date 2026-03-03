import type { AuditResponse, QuestionGroup } from '../types/audit.types';

const responseValueToScore = (response?: AuditResponse['response']): number => {
	if (response === 'Yes') return 1;
	if (response === 'NA') return 0.5;
	return 0;
};

export const scoringEngine = {
	calculateFromGroups(groups: QuestionGroup[], responses: AuditResponse[]): { totalScore: number; groupScores: Record<string, number> } {
		if (!groups.length) return { totalScore: 0, groupScores: {} };

		const totalWeightage = groups.reduce((acc, group) => acc + group.weightage, 0) || 1;
		const groupScores: Record<string, number> = {};

		const weightedScore = groups.reduce((acc, group) => {
			if (!group.questions.length) {
				groupScores[group.id] = 0;
				return acc;
			}

			const questionAverage =
				group.questions.reduce((groupAcc, question) => {
					const response = responses.find((item) => item.questionId === question.id)?.response;
					return groupAcc + responseValueToScore(response);
				}, 0) / group.questions.length;

			const groupPercent = Math.round(questionAverage * 100);
			groupScores[group.id] = groupPercent;

			return acc + questionAverage * (group.weightage / totalWeightage);
		}, 0);

		return {
			totalScore: Math.round(weightedScore * 100),
			groupScores
		};
	}
};

// TODO(Phase 2): Move scoring to the backend with policy versioning and audit-trail support.
