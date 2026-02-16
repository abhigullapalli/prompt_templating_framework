import type { AppState } from '../types';

const now = new Date().toISOString();

export const seedState: AppState = {
  users: [
    { id: 'u-admin', name: 'Alice Admin', email: 'admin@local.test', role: 'Admin', isTestUser: true },
    { id: 'u-auditor', name: 'Uma User', email: 'user@local.test', role: 'User', isTestUser: true },
    { id: 'u-reviewer', name: 'Ravi Reviewer', email: 'reviewer@local.test', role: 'Reviewer', isTestUser: true }
  ],
  auditTypes: [
    {
      id: 'at-call',
      name: 'Call Quality Audit',
      description: 'Sample QA audit with weighted and mandatory checks.',
      supportsWeightage: true,
      allowsSecondaryAudit: true,
      scoringMode: 'hybrid'
    }
  ],
  questionGroups: [
    {
      id: 'g-compliance',
      auditTypeId: 'at-call',
      groupName: 'Compliance',
      groupWeightage: 0.6,
      description: 'Policy and regulatory checks'
    },
    {
      id: 'g-experience',
      auditTypeId: 'at-call',
      groupName: 'Customer Experience',
      groupWeightage: 0.4,
      description: 'Service quality checks'
    }
  ],
  questions: [
    {
      id: 'q-1',
      auditTypeId: 'at-call',
      questionGroupId: 'g-compliance',
      questionText: 'Did the auditor verify customer identity?',
      weightage: 0.3,
      allowsComments: true,
      isMandatory: true
    },
    {
      id: 'q-2',
      auditTypeId: 'at-call',
      questionGroupId: 'g-compliance',
      questionText: 'Was disclosure language read correctly?',
      weightage: 0.3,
      allowsComments: true,
      isMandatory: true
    },
    {
      id: 'q-3',
      auditTypeId: 'at-call',
      questionGroupId: 'g-experience',
      questionText: 'Was empathy demonstrated?',
      weightage: 0.2,
      allowsComments: true,
      isMandatory: false
    },
    {
      id: 'q-4',
      auditTypeId: 'at-call',
      questionGroupId: 'g-experience',
      questionText: 'Was resolution provided within SLA?',
      weightage: 0.2,
      allowsComments: false,
      isMandatory: true
    }
  ],
  audits: [
    {
      id: 'a-1001',
      auditTypeId: 'at-call',
      auditorId: 'u-auditor',
      additionalAuditId: 'CASE-42',
      status: 'In Progress',
      percentageComplete: 25,
      score: 25,
      comments: 'Initial QA sample',
      createdDate: now,
      lastUpdatedDate: now
    }
  ],
  responses: [
    {
      auditId: 'a-1001',
      questionId: 'q-1',
      responseValue: 'Yes',
      comment: 'Verified via DOB and account number',
      answeredBy: 'u-auditor',
      answeredDate: now
    }
  ],
  notifications: [
    {
      id: 'n-1',
      title: 'POC Initialized',
      message: 'Local storage state seeded with test users and one sample audit.',
      createdAt: now
    }
  ]
};
