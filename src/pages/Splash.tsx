import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo.png';

export default function Splash() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/dashboard', { replace: true });
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <img src={logo} alt="PothiPatra" className="h-16 object-contain animate-fade-in" />
    </div>
  );
}
