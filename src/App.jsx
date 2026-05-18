import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import PrivateRoute from './components/PrivateRoute';
import PublicCalendar from './pages/PublicCalendar';
import Login from './pages/Login';
import Admin from './pages/Admin';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter basename="/icu-kgkebs">
        <Navbar />
        <Routes>
          <Route path="/" element={<PublicCalendar />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={
            <PrivateRoute>
              <Admin />
            </PrivateRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
