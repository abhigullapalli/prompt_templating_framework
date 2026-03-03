import { v4 as uuid } from 'uuid';
import { localRepository } from '../infrastructure/local.repository';
import type { AuditType, User } from '../types/audit.types';

export const seedAppData = (): void => {
	const users = localRepository.read<User[]>('users', []);
	if (users.length > 0) return;

	const seedUsers: User[] = [
		{ id: uuid(), name: 'Administrator', email: 'admin@example.com', role: 'Admin' },
		{ id: uuid(), name: 'Quality Analyst', email: 'analyst@example.com', role: 'User' },
		{ id: uuid(), name: 'Review Lead', email: 'reviewer@example.com', role: 'Reviewer' }
	];

	const seedAuditTypes: AuditType[] = [
		{
			id: uuid(),
			name: 'Fire Audit',
			description: 'Environment, compliance, and safety review template.',
			enabled: true,
			groups: [
				{
					id: uuid(),
					name: 'Compliance',
					weightage: 60,
					questions: [
						{ id: uuid(), text: 'Were compliance steps documented?', isMandatory: true },
						{ id: uuid(), text: 'Was exception handling followed?', isMandatory: true }
					]
				},
				{
					id: uuid(),
					name: 'Communication',
					weightage: 40,
					questions: [
						{ id: uuid(), text: 'Was customer communication clear?', isMandatory: true }
					]
				}
			]
		}
	];

	localRepository.write('users', seedUsers);
	localRepository.write('audit-types', seedAuditTypes);
	localRepository.write('audits', []);
};

// TODO(Phase 2): Seed should come from backend APIs and enterprise configuration storage.
