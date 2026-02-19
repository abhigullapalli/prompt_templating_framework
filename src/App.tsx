import { useMemo, useState } from 'react';
import { loadState, resetState, saveState } from './services/storage';
import { calculateCompletion, calculateScore } from './services/scoring';
import type { AppState, Audit, AuditStatus, NotificationItem, Question, ResponseValue, User } from './types';

const statuses: AuditStatus[] = [
  'Draft',
  'In Progress',
  'Submitted',
  'Rebutted',
  'Under Review',
  'Completed',
  'Secondary Audit',
  'Closed'
];

const id = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const addNotification = (state: AppState, title: string, message: string): AppState => {
  const item: NotificationItem = { id: id('n'), title, message, createdAt: new Date().toISOString() };
  return { ...state, notifications: [item, ...state.notifications].slice(0, 20) };
};

const App = () => {
  const [state, setState] = useState<AppState>(() => loadState());
  const [activeUserId, setActiveUserId] = useState(state.users[0]?.id ?? '');
  const [selectedAuditId, setSelectedAuditId] = useState(state.audits[0]?.id ?? '');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const activeUser = state.users.find((u) => u.id === activeUserId);
  const isAdmin = activeUser?.role === 'Admin';

  const upsertState = (updater: (prev: AppState) => AppState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  };

  const auditsVisible = useMemo(() => {
    let audits = isAdmin ? state.audits : state.audits.filter((a) => a.auditorId === activeUserId || a.rebuttalAssignedTo === activeUserId);
    if (statusFilter !== 'All') audits = audits.filter((a) => a.status === statusFilter);
    return audits;
  }, [state.audits, isAdmin, activeUserId, statusFilter]);

  const selectedAudit = state.audits.find((a) => a.id === selectedAuditId) ?? auditsVisible[0];
  const selectedType = selectedAudit && state.auditTypes.find((t) => t.id === selectedAudit.auditTypeId);
  const selectedQuestions = selectedAudit
    ? state.questions.filter((q) => q.auditTypeId === selectedAudit.auditTypeId)
    : [];
  const selectedResponses = selectedAudit
    ? state.responses.filter((r) => r.auditId === selectedAudit.id)
    : [];

  const saveResponse = (audit: Audit, question: Question, responseValue: ResponseValue, comment?: string) => {
    if (!activeUser) return;
    upsertState((prev) => {
      const existingIndex = prev.responses.findIndex((r) => r.auditId === audit.id && r.questionId === question.id);
      const payload = {
        auditId: audit.id,
        questionId: question.id,
        responseValue,
        comment,
        answeredBy: activeUser.id,
        answeredDate: new Date().toISOString()
      };
      const responses = [...prev.responses];
      if (existingIndex >= 0) responses[existingIndex] = payload;
      else responses.push(payload);

      const auditType = prev.auditTypes.find((at) => at.id === audit.auditTypeId)!;
      const score = calculateScore(audit, auditType, prev.questions, responses);
      const percentageComplete = calculateCompletion(audit, prev.questions, responses);

      const audits = prev.audits.map((a) =>
        a.id === audit.id
          ? {
              ...a,
              status: (percentageComplete === 100 ? 'Submitted' : 'In Progress') as AuditStatus,
              score,
              percentageComplete,
              lastUpdatedDate: new Date().toISOString()
            }
          : a
      );
      return addNotification({ ...prev, responses, audits }, 'Audit updated', `Responses saved for ${audit.id}.`);
    });
  };

  const createAudit = () => {
    if (!activeUser || !isAdmin) return;
    const defaultType = state.auditTypes[0];
    const defaultAuditor = state.users.find((u) => u.role === 'User') ?? state.users[0];
    upsertState((prev) => {
      const audit: Audit = {
        id: id('a'),
        auditTypeId: defaultType.id,
        auditorId: defaultAuditor.id,
        additionalAuditId: `CTX-${Math.floor(Math.random() * 1000)}`,
        status: 'Draft',
        percentageComplete: 0,
        score: 0,
        comments: '',
        createdDate: new Date().toISOString(),
        lastUpdatedDate: new Date().toISOString()
      };
      return addNotification({ ...prev, audits: [audit, ...prev.audits] }, 'Audit assigned', `Audit ${audit.id} created.`);
    });
  };

  const raiseRebuttal = (auditId: string, comment: string) => {
    upsertState((prev) => {
      const audits = prev.audits.map((a) =>
        a.id === auditId
          ? { ...a, status: 'Rebutted' as AuditStatus, rebuttalComment: comment, lastUpdatedDate: new Date().toISOString() }
          : a
      );
      return addNotification({ ...prev, audits }, 'Rebuttal raised', `Audit ${auditId} moved to Rebutted.`);
    });
  };

  const assignRebuttal = (auditId: string, reviewerId: string) => {
    if (!isAdmin) return;
    upsertState((prev) => {
      const audits = prev.audits.map((a) =>
        a.id === auditId
          ? {
              ...a,
              status: 'Under Review' as AuditStatus,
              rebuttalAssignedTo: reviewerId,
              lastUpdatedDate: new Date().toISOString()
            }
          : a
      );
      return addNotification({ ...prev, audits }, 'Rebuttal assigned', `Audit ${auditId} assigned for review.`);
    });
  };

  const createSecondary = (audit: Audit) => {
    if (!isAdmin) return;
    upsertState((prev) => {
      const secondary: Audit = {
        ...audit,
        id: id('a2'),
        secondaryAuditOf: audit.id,
        status: 'Secondary Audit',
        percentageComplete: 0,
        score: 0,
        createdDate: new Date().toISOString(),
        lastUpdatedDate: new Date().toISOString()
      };
      return addNotification(
        { ...prev, audits: [secondary, ...prev.audits] },
        'Secondary audit created',
        `Secondary audit ${secondary.id} linked to ${audit.id}.`
      );
    });
  };

  const completedCount = state.audits.filter((a) => a.status === 'Completed' || a.status === 'Closed').length;
  const submittedCount = state.audits.filter((a) => a.status === 'Submitted').length;
  const rebuttalCount = state.audits.filter((a) => a.status === 'Rebutted' || a.status === 'Under Review').length;

  return (
    <div className="layout">
      <header className="hero">
        <div>
          <p className="eyebrow">Audit Operations Hub</p>
          <h1>Audit Management Application</h1>
          <p>Track execution, rebuttals, and secondary audits from a single workspace.</p>
        </div>
        <div className="metric-row">
          <article className="metric-card">
            <span>Total Audits</span>
            <strong>{state.audits.length}</strong>
          </article>
          <article className="metric-card">
            <span>Submitted</span>
            <strong>{submittedCount}</strong>
          </article>
          <article className="metric-card">
            <span>Rebuttals</span>
            <strong>{rebuttalCount}</strong>
          </article>
          <article className="metric-card">
            <span>Completed/Closed</span>
            <strong>{completedCount}</strong>
          </article>
        </div>
      </header>

      <section className="card row controls">
        <label>
          Active Test User
          <select value={activeUserId} onChange={(e) => setActiveUserId(e.target.value)}>
            {state.users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.role})
              </option>
            ))}
          </select>
        </label>
        <label>
          Status Filter
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option>All</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <button onClick={createAudit} disabled={!isAdmin}>
          + Create Audit (Admin)
        </button>
        <button
          className="secondary"
          onClick={() => {
            const fresh = resetState();
            setState(fresh);
            setActiveUserId(fresh.users[0].id);
            setSelectedAuditId(fresh.audits[0].id);
          }}
        >
          Reset Local Data
        </button>
      </section>

      <main className="grid">
        <section className="card">
          <h2>{isAdmin ? 'All Audits' : 'My Audits'}</h2>
          <ul className="audit-list">
            {auditsVisible.map((a) => {
              const assigned = state.users.find((u) => u.id === a.auditorId)?.name;
              return (
                <li key={a.id} className={selectedAudit?.id === a.id ? 'active' : ''} onClick={() => setSelectedAuditId(a.id)}>
                  <strong>{a.id}</strong> - {a.status}
                  <div>{assigned}</div>
                  <small>
                    Progress {a.percentageComplete}% · Score {a.score}
                  </small>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="card workspace">
          <h2>Audit Workspace</h2>
          {!selectedAudit || !selectedType ? (
            <p>No audit selected.</p>
          ) : (
            <>
              <p>
                <strong>{selectedType.name}</strong> · {selectedAudit.id} · {selectedAudit.status}
              </p>
              <p>AdditionalAuditID: {selectedAudit.additionalAuditId}</p>
              <p>
                Scoring mode: <code>{selectedType.scoringMode}</code> | Supports weightage: {String(selectedType.supportsWeightage)}
              </p>
              {selectedQuestions.map((q) => {
                const response = selectedResponses.find((r) => r.questionId === q.id);
                return (
                  <div key={q.id} className="question-block">
                    <p>
                      {q.questionText} {q.isMandatory ? <span className="pill">Mandatory</span> : null}
                    </p>
                    <div className="row">
                      {(['Yes', 'No', 'NA'] as ResponseValue[]).map((value) => (
                        <button
                          key={value}
                          className={response?.responseValue === value ? 'selected' : ''}
                          onClick={() => saveResponse(selectedAudit, q, value, response?.comment)}
                          disabled={!activeUser || (activeUser.role === 'User' && selectedAudit.auditorId !== activeUser.id)}
                        >
                          {value}
                        </button>
                      ))}
                    </div>
                    {q.allowsComments && (
                      <input
                        placeholder="Comment"
                        value={response?.comment ?? ''}
                        onChange={(e) => saveResponse(selectedAudit, q, response?.responseValue ?? 'NA', e.target.value)}
                        disabled={!activeUser || (activeUser.role === 'User' && selectedAudit.auditorId !== activeUser.id)}
                      />
                    )}
                  </div>
                );
              })}

              <div className="row wrap">
                <button onClick={() => raiseRebuttal(selectedAudit.id, 'POC rebuttal justification')}>Raise Rebuttal</button>
                <label>
                  Assign rebuttal to reviewer
                  <select onChange={(e) => assignRebuttal(selectedAudit.id, e.target.value)} defaultValue="">
                    <option value="" disabled>
                      Select reviewer
                    </option>
                    {state.users
                      .filter((u) => u.role === 'Reviewer' || u.role === 'Admin')
                      .map((u: User) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                  </select>
                </label>
                <button onClick={() => createSecondary(selectedAudit)} disabled={!selectedType.allowsSecondaryAudit || !isAdmin}>
                  Create Secondary Audit
                </button>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <h2>Notifications (In-App)</h2>
          <ul className="notifications">
            {state.notifications.map((n) => (
              <li key={n.id}>
                <strong>{n.title}</strong>
                <p>{n.message}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="card">
          <h2>Phase 2 Integration Stubs</h2>
          <ul>
            <li>
              <strong>Azure AD IAM Stub:</strong> Not enabled in POC. Replace local test user selector with AD login and claim-based role mapping.
            </li>
            <li>
              <strong>Email Notification Stub:</strong> Notification service is local-only; SMTP/Graph integration intentionally omitted.
            </li>
            <li>
              <strong>Database Stub:</strong> Persistence is via localStorage; abstracted storage service allows future SQL repository implementation.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
};

export default App;
