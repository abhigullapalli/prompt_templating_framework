export type Role = 'Admin' | 'User' | 'Reviewer';

export type AuditStatus =
  | 'Draft'
  | 'In Progress'
  | 'Submitted'
  | 'Rebutted'
  | 'Under Review'
  | 'Completed'
  | 'Secondary Audit'
  | 'Closed';

export type ScoringMode = 'completion' | 'weightage' | 'hybrid';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isTestUser: boolean;
}

export interface AuditType {
  id: string;
  name: string;
  description: string;
  supportsWeightage: boolean;
  allowsSecondaryAudit: boolean;
  scoringMode: ScoringMode;
}

export interface QuestionGroup {
  id: string;
  auditTypeId: string;
  groupName: string;
  groupWeightage: number;
  description: string;
}

export interface Question {
  id: string;
  auditTypeId: string;
  questionGroupId: string;
  questionText: string;
  weightage?: number;
  allowsComments: boolean;
  isMandatory: boolean;
}

export type ResponseValue = 'Yes' | 'No' | 'NA';

export interface AuditResponse {
  auditId: string;
  questionId: string;
  responseValue: ResponseValue;
  comment?: string;
  answeredBy: string;
  answeredDate: string;
}

export interface Audit {
  id: string;
  auditTypeId: string;
  auditorId: string;
  additionalAuditId: string;
  status: AuditStatus;
  percentageComplete: number;
  score: number;
  comments: string;
  createdDate: string;
  lastUpdatedDate: string;
  rebuttalComment?: string;
  rebuttalAssignedTo?: string;
  secondaryAuditOf?: string;
}

export interface AppState {
  users: User[];
  auditTypes: AuditType[];
  questionGroups: QuestionGroup[];
  questions: Question[];
  audits: Audit[];
  responses: AuditResponse[];
  notifications: NotificationItem[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}
