import { useState, type ChangeEvent, type FormEvent } from 'react';
import { AuthLayout } from '../layouts/AuthLayout';
import { authService } from '../services/auth.service';

interface RegisterFormState {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const INITIAL_FORM_STATE: RegisterFormState = {
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export function RegisterPage() {
  const [formState, setFormState] = useState<RegisterFormState>(INITIAL_FORM_STATE);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormState((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');

    if (formState.password !== formState.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authService.register({
        fullName: formState.fullName,
        email: formState.email,
        password: formState.password,
      });

      setSuccessMessage(result.message);
      setFormState(INITIAL_FORM_STATE);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start managing your job applications with one workspace."
    >
      <form className="auth-form" onSubmit={onSubmit}>
        <label htmlFor="fullName">Full name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          value={formState.fullName}
          onChange={onChange}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          value={formState.email}
          onChange={onChange}
          required
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={formState.password}
          onChange={onChange}
          required
          minLength={6}
        />

        <label htmlFor="confirmPassword">Confirm password</label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={formState.confirmPassword}
          onChange={onChange}
          required
          minLength={6}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        {error ? <p className="auth-message auth-message-error">{error}</p> : null}
        {successMessage ? <p className="auth-message auth-message-success">{successMessage}</p> : null}
      </form>
    </AuthLayout>
  );
}
