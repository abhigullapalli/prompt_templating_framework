import { v4 as uuid } from 'uuid';
import { localRepository } from '../infrastructure/local.repository';
import type { AuditType, Question, User } from '../types/audit.types';

export const seedAppData = (): void => {
  const users = localRepository.read<User[]>('users', []);
  if (users.length > 0) return;

  const seedUsers: User[] = [
    { id: uuid(), name: 'Admin User', email: 'admin@example.com', role: 'Admin' },
    { id: uuid(), name: 'Audit User', email: 'user@example.com', role: 'User' },
    { id: uuid(), name: 'Reviewer User', email: 'reviewer@example.com', role: 'Reviewer' }
  ];

  const seedAuditTypes: AuditType[] = [
    { id: 'at-call-quality', name: 'Call Quality', description: 'Call quality monitoring template' }
  ];

  const seedQuestions: Question[] = [
    { id: uuid(), auditTypeId: 'at-call-quality', text: 'Greeting followed?', weight: 30, isMandatory: true },
    { id: uuid(), auditTypeId: 'at-call-quality', text: 'Correct resolution provided?', weight: 50, isMandatory: true },
    { id: uuid(), auditTypeId: 'at-call-quality', text: 'Closing script used?', weight: 20, isMandatory: false }
  ];

  localRepository.write('users', seedUsers);
  localRepository.write('audit-types', seedAuditTypes);
  localRepository.write('questions', seedQuestions);
};

// TODO(Phase 2): Pull seed/bootstrap data from backend APIs instead of local data.
