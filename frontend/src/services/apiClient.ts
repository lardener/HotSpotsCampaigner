const DEFAULT_API_BASE_URL = '/api';

export const getApiBaseUrl = (): string => {
    const baseUrl = (import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_GRAPHQL_API_URL) as string | undefined;
    return baseUrl && baseUrl.length > 0 ? baseUrl : DEFAULT_API_BASE_URL;
};

export const buildApiUrl = (path: string, query?: URLSearchParams): string => {
    const base = getApiBaseUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    // Handle both absolute (http...) and relative (/api) base URLs
    const absoluteBase = base.startsWith('http')
        ? base
        : `${window.location.origin}${base}`;

    // Construct the URL ensuring we don't double-slash or miss a slash
    const url = new URL(normalizedPath.substring(1), absoluteBase.endsWith('/') ? absoluteBase : `${absoluteBase}/`);

    console.log(`[API] Constructing URL for path ${path} -> ${url.toString()}`);

    if (query) {
        url.search = query.toString();
    }
    return url.toString();
};

export async function fetchJson<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(buildApiUrl(path), { credentials: 'include', ...options });
    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(errorText || `Request failed with status ${response.status}`);
        (error as any).status = response.status;
        throw error;
    }
    return (await response.json()) as T;
}

export async function fetchVoid(path: string, options: RequestInit = {}): Promise<void> {
    const response = await fetch(buildApiUrl(path), { credentials: 'include', ...options });
    if (!response.ok) {
        const errorText = await response.text();
        const error = new Error(errorText || `Request failed with status ${response.status}`);
        (error as any).status = response.status;
        throw error;
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
    delete: (path: string) => fetchVoid(path, { method: 'DELETE' }),
};

export default apiClient;
