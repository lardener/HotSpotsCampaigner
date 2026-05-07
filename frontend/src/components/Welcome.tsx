import '../styles/welcome.css';

interface WelcomeProps {
  userName: string;
}

export function Welcome({ userName }: WelcomeProps) {
  return (
    <div className="welcome-container">
      <h1>Welcome {userName} to the Mercenary Life</h1>
    </div>
  );
}
