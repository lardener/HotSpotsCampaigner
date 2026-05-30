import '../styles/login.css';

export function Login() {
  const handleGoogleLogin = () => {
    // Point to the backend server port to initiate the OAuth flow
    window.location.href = 'http://localhost:8080/login/oauth2/authorization/google';
  };

  return (
    <button type="button" onClick={handleGoogleLogin} className="mode-btn theme-red" title="Login with your Google account" style={{ padding: '10px 20px' }}>
      Login with Google
    </button>
  );
}
