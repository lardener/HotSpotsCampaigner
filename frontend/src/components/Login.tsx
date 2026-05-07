import '../styles/login.css';

export function Login() {
  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  return (
    <div className="login-container">
      <button onClick={handleGoogleLogin} className="google-login-btn">
        Login with Google
      </button>
    </div>
  );
}
