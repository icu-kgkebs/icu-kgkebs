import { NavLink, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="navbar">
      <NavLink to="/" className="navbar-brand">
        <span className="navbar-brand-icon">✞</span>
        ICU KGKEBS
      </NavLink>

      <div className="navbar-links">
        <NavLink to="/" end className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
          カレンダー
        </NavLink>

        {user && (
          <NavLink to="/admin" className={({ isActive }) => `navbar-link${isActive ? ' active' : ''}`}>
            管理者
          </NavLink>
        )}

        {user ? (
          <button className="navbar-btn" onClick={handleLogout}>
            ログアウト
          </button>
        ) : (
          <NavLink to="/login" className="navbar-btn" style={{ textDecoration: 'none' }}>
            ログイン
          </NavLink>
        )}
      </div>
    </nav>
  );
}
