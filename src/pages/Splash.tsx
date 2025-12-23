import logo from '@/assets/logo.png';

export default function Splash() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <img src={logo} alt="PothiPatra" className="h-16 object-contain animate-fade-in" />
    </div>
  );
}
