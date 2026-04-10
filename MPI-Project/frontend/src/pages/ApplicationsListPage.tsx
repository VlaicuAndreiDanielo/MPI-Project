import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsService } from '../services/applications.service';
import { useAuth } from '../context/AuthContext';
import type { JobApplication } from '../types/applications';

const STATUS_LABELS: Record<JobApplication['status'], string> = {
  APPLIED: 'Applied',
  INTERVIEW: 'Interview',
  OFFER: 'Offer',
  REJECTED: 'Rejected',
};

const formatDate = (rawDate: string) =>
  new Date(rawDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

export function ApplicationsListPage() {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadApplications = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response = await applicationsService.getByUser(user.id);
        setApplications(response);
      } catch {
        setError('Could not load applications list.');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [user]);

  const content = useMemo(() => {
    if (isLoading) {
      return <p className="applications-state">Loading applications...</p>;
    }

    if (error) {
      return <p className="applications-state applications-state-error">{error}</p>;
    }

    if (applications.length === 0) {
      return <p className="applications-state">No applications yet.</p>;
    }

    return (
      <div className="applications-table-wrap">
        <table className="applications-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Role</th>
              <th>Status</th>
              <th>Applied</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.map((application) => (
              <tr key={application.id}>
                <td>{application.companyName}</td>
                <td>{application.roleTitle}</td>
                <td>
                  <span className={`status-pill status-${application.status.toLowerCase()}`}>
                    {STATUS_LABELS[application.status]}
                  </span>
                </td>
                <td>{formatDate(application.appliedAt)}</td>
                <td>{formatDate(application.createdAt)}</td>
                <td>
                  <Link className="table-edit-link" to={`/applications/${application.id}/edit`}>
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [applications, error, isLoading]);

  return (
    <main className="applications-shell">
      <section className="applications-panel">
        <header className="applications-header">
          <div>
            <p className="auth-kicker">Dashboard</p>
            <h1>Applications</h1>
            <p className="auth-subtitle">Hello, {user?.fullName}. Here you can see all your applications.</p>
          </div>
          <div className="applications-actions">
            <Link className="applications-add" to="/applications/new">
              Add application
            </Link>
            <button className="auth-logout" type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        {content}
      </section>
    </main>
  );
}
