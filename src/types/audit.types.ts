export type UserRole = 'Admin' | 'User' | 'Reviewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

export interface Question {
  id: string;
  auditTypeId: string;
  text: string;
  weight: number;
  isMandatory: boolean;
}

export interface AuditType {
  id: string;
  name: string;
  description: string;
}

export type ResponseValue = 'Yes' | 'No' | 'NA';

export interface AuditResponse {
  questionId: string;
  response: ResponseValue;
  comment?: string;
}

export type AuditStatus = 'Draft' | 'In Progress' | 'Submitted' | 'Rebutted' | 'Completed';

export interface Audit {
  id: string;
  auditTypeId: string;
  auditorId: string;
  status: AuditStatus;
  responses: AuditResponse[];
  score: number;
  createdAt: string;
  updatedAt: string;
}

// TODO(Phase 2): Add database-backed entities and notification metadata contracts.
