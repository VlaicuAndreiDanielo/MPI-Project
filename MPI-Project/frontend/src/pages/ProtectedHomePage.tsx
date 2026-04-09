import { useAuth } from '../context/AuthContext';

export function ProtectedHomePage() {
  const { user, logout } = useAuth();

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <p className="auth-kicker">Private Area</p>
        <h1>Hello, {user?.fullName}</h1>
        <p className="auth-subtitle">You are logged in and this route is protected.</p>
        <button className="auth-logout" type="button" onClick={logout}>
          Logout
        </button>
      </section>
    </main>
  );
}
