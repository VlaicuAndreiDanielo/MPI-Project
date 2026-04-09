import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { applicationsService } from '../services/applications.service';
import type { ApplicationStatus, CreateJobApplicationPayload } from '../types/applications';

interface CreateApplicationFormState {
  companyName: string;
  roleTitle: string;
  status: ApplicationStatus;
  appliedAt: string;
}

const INITIAL_FORM_STATE: CreateApplicationFormState = {
  companyName: '',
  roleTitle: '',
  status: 'APPLIED',
  appliedAt: '',
};

export function CreateApplicationPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formState, setFormState] = useState<CreateApplicationFormState>(INITIAL_FORM_STATE);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!user) {
      setError('You need to be logged in to create an application.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const payload: CreateJobApplicationPayload = {
      userId: user.id,
      companyName: formState.companyName.trim(),
      roleTitle: formState.roleTitle.trim(),
      status: formState.status,
      appliedAt: formState.appliedAt,
    };

    try {
      await applicationsService.create(payload);
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Could not create application. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="applications-shell">
      <section className="auth-panel create-application-panel">
        <p className="auth-kicker">New Application</p>
        <h1>Add job application</h1>
        <p className="auth-subtitle">Fill out the form below to save a new application.</p>

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

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save application'}
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
