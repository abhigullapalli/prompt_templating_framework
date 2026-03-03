export type UserRole = 'Admin' | 'User' | 'Reviewer';

export type ResponseValue = 'Yes' | 'No' | 'NA';

export type AuditStatus = 'Draft' | 'In Progress' | 'Submitted' | 'Completed';

export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
}

export interface Question {
	id: string;
	text: string;
	isMandatory: boolean;
}

export interface QuestionGroup {
	id: string;
	name: string;
	weightage: number;
	questions: Question[];
}

export interface AuditType {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
	groups: QuestionGroup[];
}

export interface AuditResponse {
	questionId: string;
	response: ResponseValue;
	comment?: string;
}

export interface Audit {
	id: string;
	auditTypeId: string;
	auditTypeName: string;
	auditorId: string;
	status: AuditStatus;
	responses: AuditResponse[];
	score: number;
	groupScores: Record<string, number>;
	createdAt: string;
	updatedAt: string;
}

// TODO(Phase 2): Extend domain contracts with database IDs, notification events, and workflow approvals.
