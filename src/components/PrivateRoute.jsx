import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  if (user === undefined) return <div className="loading-screen">読み込み中...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
