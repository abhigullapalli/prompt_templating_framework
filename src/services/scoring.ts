import type { Audit, AuditResponse, AuditType, Question } from '../types';

const toNumeric = (value: AuditResponse['responseValue']) => {
  if (value === 'Yes') return 1;
  if (value === 'No') return 0;
  return 0.5;
};

export const calculateCompletion = (audit: Audit, questions: Question[], responses: AuditResponse[]) => {
  const relevant = questions.filter((q) => q.auditTypeId === audit.auditTypeId && q.isMandatory);
  if (relevant.length === 0) return 0;
  const answered = relevant.filter((q) => responses.some((r) => r.auditId === audit.id && r.questionId === q.id));
  return Math.round((answered.length / relevant.length) * 100);
};

const calculateWeightageScore = (audit: Audit, questions: Question[], responses: AuditResponse[]) => {
  const relevantQuestions = questions.filter((q) => q.auditTypeId === audit.auditTypeId);
  if (relevantQuestions.length === 0) return 0;

  const totalWeight = relevantQuestions.reduce((acc, q) => acc + (q.weightage ?? 0), 0) || 1;
  const weighted = relevantQuestions.reduce((acc, q) => {
    const response = responses.find((r) => r.auditId === audit.id && r.questionId === q.id);
    if (!response) return acc;
    return acc + ((q.weightage ?? 0) / totalWeight) * 100 * toNumeric(response.responseValue);
  }, 0);

  return Math.round(weighted);
};

export const calculateScore = (
  audit: Audit,
  auditType: AuditType,
  questions: Question[],
  responses: AuditResponse[]
) => {
  const completionScore = calculateCompletion(audit, questions, responses);
  const weightageScore = calculateWeightageScore(audit, questions, responses);

  if (auditType.scoringMode === 'completion') return completionScore;
  if (auditType.scoringMode === 'weightage') return weightageScore;
  return Math.round((completionScore + weightageScore) / 2);
};
