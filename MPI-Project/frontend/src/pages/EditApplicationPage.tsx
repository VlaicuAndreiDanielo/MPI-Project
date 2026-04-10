import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsService } from '../services/applications.service';
import type { ApplicationStatus, JobApplication } from '../types/applications';

interface EditApplicationFormState {
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
  note: string;
}

const toDateInputValue = (value: string) => {
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 10);
};

export function EditApplicationPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [application, setApplication] = useState<JobApplication | null>(null);
  const [formState, setFormState] = useState<EditApplicationFormState>({
    companyName: '',
    roleTitle: '',
    status: 'APPLIED',
    appliedAt: '',
    note: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || !id) {
      setError('Invalid application request.');
      setIsLoading(false);
      return;
    }

    const loadApplication = async () => {
      setIsLoading(true);
      setError('');

      try {
        const applications = await applicationsService.getByUser(user.id);
        const existingApplication = applications.find((item) => item.id === id);

        if (!existingApplication) {
          setError('Application not found or not owned by current user.');
          return;
        }

        setApplication(existingApplication);
        setFormState({
          companyName: existingApplication.companyName,
          roleTitle: existingApplication.roleTitle,
          status: existingApplication.status,
          appliedAt: toDateInputValue(existingApplication.appliedAt),
          note: '',
        });
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Could not load application.');
      } finally {
        setIsLoading(false);
      }
    };

    loadApplication();
  }, [id, user]);

  const onChange = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement> | ChangeEvent<HTMLTextAreaElement>,
  ) => {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user || !application) {
      setError('Invalid application request.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await applicationsService.update(application.id, {
        userId: user.id,
        companyName: formState.companyName.trim(),
        roleTitle: formState.roleTitle.trim(),
        status: formState.status,
        appliedAt: formState.appliedAt,
      });

      const noteContent = formState.note.trim();
      if (noteContent) {
        await applicationsService.addNote(application.id, {
          userId: user.id,
          content: noteContent,
        });
      }

      navigate('/', { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not update application. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <main className="applications-shell">
        <section className="auth-panel create-application-panel">
          <p className="applications-state">Loading application...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="applications-shell">
      <section className="auth-panel create-application-panel">
        <p className="auth-kicker">Edit Application</p>
        <h1>Update application</h1>
        <p className="auth-subtitle">Update details and optionally add a note.</p>

        <form className="auth-form" onSubmit={onSubmit}>
          <label htmlFor="companyName">Company name</label>
          <input
            id="companyName"
            name="companyName"
            type="text"
            value={formState.companyName}
            onChange={onChange}
            required
          />

          <label htmlFor="roleTitle">Role</label>
          <input
            id="roleTitle"
            name="roleTitle"
            type="text"
            value={formState.roleTitle}
            onChange={onChange}
            required
          />

          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={formState.status} onChange={onChange}>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFER">Offer</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <label htmlFor="appliedAt">Application date</label>
          <input
            id="appliedAt"
            name="appliedAt"
            type="date"
            value={formState.appliedAt}
            onChange={onChange}
            required
          />

          <label htmlFor="note">Note (optional)</label>
          <textarea
            id="note"
            name="note"
            rows={4}
            value={formState.note}
            onChange={onChange}
            placeholder="Add a follow-up note"
          />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save changes'}
          </button>

          {error ? <p className="auth-message auth-message-error">{error}</p> : null}
        </form>

        <p className="auth-switch">
          <Link to="/">Back to applications</Link>
        </p>
      </section>
    </main>
  );
}
