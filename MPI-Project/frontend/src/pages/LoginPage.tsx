import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';

interface LoginFormState {
  email: string;
  password: string;
}

const INITIAL_LOGIN_FORM: LoginFormState = {
  email: '',
  password: '',
};

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formState, setFormState] = useState<LoginFormState>(INITIAL_LOGIN_FORM);
  const [error, setError] = useState('');
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
    setIsSubmitting(true);

    try {
      const result = await authService.login(formState);
      login(result.user);
      navigate('/', { replace: true });
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to continue tracking your applications.">
      <form className="auth-form" onSubmit={onSubmit}>
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
          autoComplete="current-password"
          value={formState.password}
          onChange={onChange}
          required
          minLength={6}
        />

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Login'}
        </button>

        {error ? <p className="auth-message auth-message-error">{error}</p> : null}
      </form>

      <p className="auth-switch">
        N-ai cont? <Link to="/register">Register</Link>
      </p>
    </AuthLayout>
  );
}
