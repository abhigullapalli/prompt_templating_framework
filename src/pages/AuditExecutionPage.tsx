import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { localRepository } from '../infrastructure/local.repository';
import { scoringEngine } from '../services/scoring.engine';
import type { Audit, AuditResponse, ResponseValue, AuditType } from '../types/audit.types';

const AuditExecutionPage = () => {
	const { auditId } = useParams();
	const [audits, setAudits] = useState(() => localRepository.read<Audit[]>('audits', []));
	const [auditTypes] = useState(() => localRepository.read<AuditType[]>('audit-types', []));

	const audit = useMemo(() => audits.find((item) => item.id === auditId), [audits, auditId]);
	const auditType = useMemo(() => auditTypes.find((item) => item.id === audit?.auditTypeId), [auditTypes, audit?.auditTypeId]);

	const saveAudit = (nextAudit: Audit) => {
		const nextAudits = audits.map((item) => (item.id === nextAudit.id ? nextAudit : item));
		setAudits(nextAudits);
		localRepository.write('audits', nextAudits);
	};

	const setResponse = (questionId: string, response: ResponseValue) => {
		if (!audit || !auditType) return;

		const existing = audit.responses.find((item) => item.questionId === questionId);
		const nextResponses: AuditResponse[] = existing
			? audit.responses.map((item) => (item.questionId === questionId ? { ...item, response } : item))
			: [...audit.responses, { questionId, response }];

		const scoring = scoringEngine.calculateFromGroups(auditType.groups, nextResponses);
		const nextAudit: Audit = {
			...audit,
			responses: nextResponses,
			score: scoring.totalScore,
			groupScores: scoring.groupScores,
			status: nextResponses.length === 0 ? 'Draft' : 'In Progress',
			updatedAt: new Date().toISOString()
		};
		saveAudit(nextAudit);
	};

	if (!audit || !auditType) {
		return (
			<section className="simple-page">
				<h1>Audit not found</h1>
				<p>Please return to admin to instantiate an audit.</p>
				<Link to="/admin">Back to Admin Dashboard</Link>
			</section>
		);
	}

	return (
		<section className="simple-page">
			<h1>Audit Execution: {audit.auditTypeName}</h1>
			<p>Score: <strong>{audit.score}%</strong></p>
			<p>
				<Link to="/admin">Back to Admin Dashboard</Link>
			</p>

			{auditType.groups.map((group) => (
				<div key={group.id} className="execution-group">
					<h3>
						{group.name} <span>(Weightage: {group.weightage}%)</span>
					</h3>
					<p>Group Score: {audit.groupScores[group.id] ?? 0}%</p>
					{group.questions.map((question) => {
						const answer = audit.responses.find((item) => item.questionId === question.id)?.response;
						return (
							<div key={question.id} className="question-row">
								<p>{question.text}</p>
								<div className="answer-row">
									{(['Yes', 'No', 'NA'] as ResponseValue[]).map((option) => (
										<button
											key={option}
											type="button"
											className={answer === option ? 'selected' : ''}
											onClick={() => setResponse(question.id, option)}
										>
											{option}
										</button>
									))}
								</div>
							</div>
						);
					})}
				</div>
			))}
			{/* TODO(Phase 2): Persist scoring and responses to API/database and send notifications. */}
		</section>
	);
};

export default AuditExecutionPage;
