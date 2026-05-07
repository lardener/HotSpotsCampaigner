import '../styles/login.css';

export function Login() {
  const handleGoogleLogin = () => {
    // Point to the backend server port to initiate the OAuth flow
    window.location.href = 'http://localhost:8080/login/oauth2/authorization/google';
  };

  return (
    <div className="login-container">
      <button onClick={handleGoogleLogin} className="google-login-btn">
        Login with Google
      </button>
    </div>
  );
}
