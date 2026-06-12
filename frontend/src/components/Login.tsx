import '../styles/login.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_GRAPHQL_API_URL || '/api';

export function Login() {
  const handleGoogleLogin = () => {
    // Point to the backend server port to initiate the OAuth flow
    window.location.href = `${API_BASE_URL}/login/oauth2/authorization/google`;
  };

  return (
    <button type="button" onClick={handleGoogleLogin} className="mode-btn theme-red" title="Login with your Google account" style={{ padding: '10px 20px' }}>
      Login with Google
    </button>
  );
}
