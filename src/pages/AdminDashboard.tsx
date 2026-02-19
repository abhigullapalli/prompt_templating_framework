import { Link } from 'react-router-dom';

const AdminDashboard = () => {
  return (
    <section>
      <h1>Admin Dashboard</h1>
      <p>Manage audits, assign users, and review rebuttals.</p>
      <Link to="/user">Go to User Dashboard</Link>
      {/* TODO(Phase 2): Add admin workflows backed by database and notification services. */}
    </section>
  );
};

export default AdminDashboard;
