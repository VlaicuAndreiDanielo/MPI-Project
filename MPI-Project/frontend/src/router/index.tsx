import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { ProtectedHomePage } from '../pages/ProtectedHomePage';
import { RegisterPage } from '../pages/RegisterPage';
import { ProtectedRoute } from './ProtectedRoute';

export function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<ProtectedHomePage />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}
