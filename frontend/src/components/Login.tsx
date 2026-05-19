import '../styles/login.css';

export function Login() {
  const handleGoogleLogin = () => {
    // Point to the backend server port to initiate the OAuth flow
    window.location.href = 'http://localhost:8080/login/oauth2/authorization/google';
  };

  return ( // Added type="button"
    <button onClick={handleGoogleLogin} className="login-button" title="Login with your Google account">
      Login with Google
    </button>
  );
}
