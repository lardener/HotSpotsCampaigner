const DEFAULT_API_BASE_URL = 'http://localhost:8080';

export const getApiBaseUrl = (): string => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL as string | undefined;
    return baseUrl && baseUrl.length > 0 ? baseUrl : DEFAULT_API_BASE_URL;
};

export const buildApiUrl = (path: string, query?: URLSearchParams): string => {
    const url = new URL(`${getApiBaseUrl()}${path}`);
    if (query) {
        url.search = query.toString();
    }
    return url.toString();
};

export async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(buildApiUrl(path), { credentials: 'include', ...options });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
    }
    return (await response.json()) as T;
}

export async function fetchVoid(path: string, options: RequestInit = {}): Promise<void> {
    const response = await fetch(buildApiUrl(path), { credentials: 'include', ...options });
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Request failed with status ${response.status}`);
    }
}

const apiClient = {
    get: <T>(path: string) => fetchJson<T>(path),
    post: <T>(path: string, body?: any) =>
        fetchJson<T>(path, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }),
};

export default apiClient;
