import { Link } from 'react-router-dom';
import { localRepository } from '../infrastructure/local.repository';
import type { Audit } from '../types/audit.types';

const UserDashboard = () => {
	const audits = localRepository.read<Audit[]>('audits', []);

	return (
		<section className="simple-page">
			<h1>User Dashboard</h1>
			<p>Open assigned audits and continue execution.</p>
			<p>
				<Link to="/admin">Go to Admin Dashboard</Link>
			</p>
			<ul>
				{audits.map((audit) => (
					<li key={audit.id}>
						{audit.auditTypeName} - {audit.status} - {audit.score}% {' '}
						<Link to={`/audit-execution/${audit.id}`}>Open</Link>
					</li>
				))}
			</ul>
			{/* TODO(Phase 2): Add live task assignment, reviewer queues, and notification service integration. */}
		</section>
	);
};

export default UserDashboard;
