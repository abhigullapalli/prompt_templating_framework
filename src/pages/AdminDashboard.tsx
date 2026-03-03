import { useMemo, useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Link, useNavigate } from 'react-router-dom';
import { localRepository } from '../infrastructure/local.repository';
import type { Audit, AuditType, QuestionGroup } from '../types/audit.types';

const readAuditTypes = () => localRepository.read<AuditType[]>('audit-types', []);
const readAudits = () => localRepository.read<Audit[]>('audits', []);
const readUsers = () => localRepository.read<{ id: string; role: string }[]>('users', []);

const AdminDashboard = () => {
	const navigate = useNavigate();
	const [activeTab, setActiveTab] = useState<'audit-types' | 'audits'>('audit-types');
	const [auditTypes, setAuditTypes] = useState<AuditType[]>(() => readAuditTypes());
	const [audits, setAudits] = useState<Audit[]>(() => readAudits());
	const [selectedTypeId, setSelectedTypeId] = useState<string>(() => readAuditTypes()[0]?.id ?? '');
	const [newTypeName, setNewTypeName] = useState('New Audit');
	const [newGroupName, setNewGroupName] = useState('');
	const [newGroupWeightage, setNewGroupWeightage] = useState(10);
	const [newQuestionText, setNewQuestionText] = useState('');
	const [selectedGroupId, setSelectedGroupId] = useState('');

	const selectedType = useMemo(() => auditTypes.find((item) => item.id === selectedTypeId), [auditTypes, selectedTypeId]);

	const persistAuditTypes = (next: AuditType[]) => {
		setAuditTypes(next);
		localRepository.write('audit-types', next);
	};

	const persistAudits = (next: Audit[]) => {
		setAudits(next);
		localRepository.write('audits', next);
	};

	const createAuditType = () => {
		const nextType: AuditType = {
			id: uuid(),
			name: newTypeName.trim() || 'Untitled Audit Type',
			description: 'Custom audit type created by administrator.',
			enabled: true,
			groups: []
		};
		const next = [nextType, ...auditTypes];
		persistAuditTypes(next);
		setSelectedTypeId(nextType.id);
		setNewTypeName('New Audit');
	};

	const addGroup = () => {
		if (!selectedType) return;
		const trimmed = newGroupName.trim();
		if (!trimmed) return;

		const newGroup: QuestionGroup = {
			id: uuid(),
			name: trimmed,
			weightage: Number.isFinite(newGroupWeightage) ? Math.max(0, newGroupWeightage) : 0,
			questions: []
		};

		const next = auditTypes.map((item) => (item.id === selectedType.id ? { ...item, groups: [...item.groups, newGroup] } : item));
		persistAuditTypes(next);
		setSelectedGroupId(newGroup.id);
		setNewGroupName('');
	};

	const addQuestion = () => {
		if (!selectedType || !selectedGroupId || !newQuestionText.trim()) return;

		const next = auditTypes.map((item) => {
			if (item.id !== selectedType.id) return item;
			return {
				...item,
				groups: item.groups.map((group) =>
					group.id === selectedGroupId
						? {
								...group,
								questions: [...group.questions, { id: uuid(), text: newQuestionText.trim(), isMandatory: true }]
							}
						: group
				)
			};
		});

		persistAuditTypes(next);
		setNewQuestionText('');
	};

	const instantiateAudit = (type: AuditType) => {
		const users = readUsers();
		const defaultAuditor = users.find((user) => user.role === 'User')?.id ?? users[0]?.id ?? 'unassigned';
		const now = new Date().toISOString();
		const audit: Audit = {
			id: uuid(),
			auditTypeId: type.id,
			auditTypeName: type.name,
			auditorId: defaultAuditor,
			status: 'Draft',
			responses: [],
			score: 0,
			groupScores: {},
			createdAt: now,
			updatedAt: now
		};
		const nextAudits = [audit, ...audits];
		persistAudits(nextAudits);
		navigate(`/audit-execution/${audit.id}`);
	};

	const totalQuestions = (type: AuditType) => type.groups.reduce((acc, group) => acc + group.questions.length, 0);
	const totalWeight = (type: AuditType) => type.groups.reduce((acc, group) => acc + group.weightage, 0);

	return (
		<div className="app-shell">
			<aside className="sidebar">
				<div className="brand">
					<p>ENTERPRISE</p>
					<strong>AUDIT SYSTEM</strong>
				</div>
				<nav className="sidebar-nav">
					<span>Overview</span>
					<span>Audits</span>
					<span className="active">Audit Types</span>
					<span>Users & Roles</span>
				</nav>
				<Link to="/user" className="nav-link">Open User Dashboard</Link>
			</aside>

			<main className="workspace-panel">
				<header className="workspace-header">
					<div>
						<h1>Audit Types</h1>
						<p>Active Environment: Phase 1 Proof-of-Concept</p>
					</div>
					<div className="toolbar">
						<input value={newTypeName} onChange={(event) => setNewTypeName(event.target.value)} placeholder="Audit type name" />
						<button onClick={createAuditType}>+ New Audit Type</button>
					</div>
				</header>

				<div className="tabs">
					<button className={activeTab === 'audit-types' ? 'tab active' : 'tab'} onClick={() => setActiveTab('audit-types')}>
						Audit Types
					</button>
					<button className={activeTab === 'audits' ? 'tab active' : 'tab'} onClick={() => setActiveTab('audits')}>
						Instantiated Audits
					</button>
				</div>

				{activeTab === 'audit-types' ? (
					<>
						<section className="card-grid">
							{auditTypes.map((type) => (
								<article key={type.id} className={selectedTypeId === type.id ? 'audit-card selected' : 'audit-card'}>
									<div className="audit-card-head">
										<h3>{type.name}</h3>
										<span className="status-pill">{type.enabled ? 'Enabled' : 'Disabled'}</span>
									</div>
									<p className="meta">Weighting: {totalWeight(type)}%</p>
									<p className="meta">Content: {totalQuestions(type)} Questions</p>
									<div className="card-actions">
										<button className="secondary" onClick={() => setSelectedTypeId(type.id)}>
											Manage Content
										</button>
										<button onClick={() => instantiateAudit(type)}>+ Instantiate Audit</button>
									</div>
								</article>
							))}
						</section>

						{selectedType && (
							<section className="editor-panel">
								<h2>Manage Content: {selectedType.name}</h2>
								<div className="editor-grid">
									<div className="editor-column">
										<h4>Add Question Group</h4>
										<input value={newGroupName} onChange={(event) => setNewGroupName(event.target.value)} placeholder="Group name" />
										<input
											type="number"
											value={newGroupWeightage}
											onChange={(event) => setNewGroupWeightage(Number(event.target.value))}
											placeholder="Weightage"
										/>
										<button onClick={addGroup}>Add Group</button>
									</div>
									<div className="editor-column">
										<h4>Add Question To Group</h4>
										<select value={selectedGroupId} onChange={(event) => setSelectedGroupId(event.target.value)}>
											<option value="">Select group</option>
											{selectedType.groups.map((group) => (
												<option key={group.id} value={group.id}>
													{group.name} ({group.weightage}%)
												</option>
											))}
										</select>
										<input
											value={newQuestionText}
											onChange={(event) => setNewQuestionText(event.target.value)}
											placeholder="Question text"
										/>
										<button onClick={addQuestion}>Add Question</button>
									</div>
								</div>

								<div className="group-list">
									{selectedType.groups.map((group) => (
										<div key={group.id} className="group-item">
											<strong>{group.name}</strong>
											<span>Weightage: {group.weightage}%</span>
											<small>{group.questions.length} Questions</small>
										</div>
									))}
								</div>
							</section>
						)}
					</>
				) : (
					<section className="table-panel">
						<h2>Instantiated Audits</h2>
						{audits.length === 0 ? (
							<p>No audits created yet. Instantiate an audit type to begin execution.</p>
						) : (
							<table>
								<thead>
									<tr>
										<th>Audit</th>
										<th>Type</th>
										<th>Status</th>
										<th>Score</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{audits.map((audit) => (
										<tr key={audit.id}>
											<td>{audit.id.slice(0, 8)}</td>
											<td>{audit.auditTypeName}</td>
											<td>{audit.status}</td>
											<td>{audit.score}%</td>
											<td>
												<button onClick={() => navigate(`/audit-execution/${audit.id}`)}>Open</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						)}
					</section>
				)}
			</main>
		</div>
	);
};

export default AdminDashboard;
