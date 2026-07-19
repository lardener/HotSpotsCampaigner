/*
 * HotSpots Campaigner - Battletech Mercenaries campaign management SaaS.
 * Copyright (C) 2026 Jose Ferrer
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
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
