import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { applicationsService } from '../services/applications.service';
import { useAuth } from '../context/AuthContext';
import type { ApplicationFilterStatus, JobApplication } from '../types/applications';

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
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ApplicationFilterStatus>('ALL');

  const handleDelete = async (application: JobApplication) => {
    if (!user) {
      setError('You need to be logged in.');
      return;
    }

    const isConfirmed = window.confirm(
      `Delete application for ${application.companyName} - ${application.roleTitle}?`,
    );

    if (!isConfirmed) {
      return;
    }

    setDeletingId(application.id);
    setError('');

    try {
      await applicationsService.remove(application.id, { userId: user.id });
      setApplications((current) => current.filter((item) => item.id !== application.id));
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : 'Could not delete application. Please try again.',
      );
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadApplications = async () => {
      setIsLoading(true);
      setError('');

      try {
        const response =
          filterStatus === 'ALL'
            ? await applicationsService.getByUser(user.id)
            : await applicationsService.getByUserAndStatus(user.id, filterStatus);
        setApplications(response);
      } catch {
        setError('Could not load applications list.');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplications();
  }, [filterStatus, user]);

  const content = useMemo(() => {
    if (isLoading) {
      return <p className="applications-state">Loading applications...</p>;
    }

    if (error) {
      return <p className="applications-state applications-state-error">{error}</p>;
    }

    if (applications.length === 0) {
      return (
        <p className="applications-state">
          {filterStatus === 'ALL'
            ? 'No applications yet.'
            : `No applications with status ${STATUS_LABELS[filterStatus]}.`}
        </p>
      );
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
                  <div className="table-actions">
                    <Link className="table-edit-link" to={`/applications/${application.id}/edit`}>
                      Edit
                    </Link>
                    <button
                      className="table-delete-button"
                      type="button"
                      onClick={() => handleDelete(application)}
                      disabled={deletingId === application.id}
                    >
                      {deletingId === application.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }, [applications, error, filterStatus, isLoading]);

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

        <div className="applications-filter-row">
          <label htmlFor="statusFilter">Filter by status</label>
          <select
            id="statusFilter"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as ApplicationFilterStatus)}
          >
            <option value="ALL">All</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        {content}
      </section>
    </main>
  );
}
