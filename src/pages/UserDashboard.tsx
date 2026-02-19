import { Link } from 'react-router-dom';

const UserDashboard = () => {
  return (
    <section>
      <h1>User Dashboard</h1>
      <p>View assigned audits and progress current executions.</p>
      <p>
        <Link to="/admin">Go to Admin Dashboard</Link>
      </p>
      <p>
        <Link to="/audit-execution">Open Audit Execution Page</Link>
      </p>
      {/* TODO(Phase 2): Add user-specific task feeds and notification center integration. */}
    </section>
  );
};

export default UserDashboard;
