import {AuthContextProps} from "react-oidc-context";

const getAuthToken = async (auth: AuthContextProps): Promise<string | null> => {
    if (!auth.isAuthenticated) return null;

    try {
        // If the token is expired or missing, refresh it
        if (!auth.user?.id_token) {
            console.warn("Token expired or missing, attempting silent refresh...");
            await auth.signinSilent();
        }

        return auth.user?.id_token || null;
    } catch (error) {
        console.error("Silent token refresh failed:", error);
        return null;
    }
};

// ✅ Reusable function to make authenticated API requests
export const authRequest = async (
    auth: AuthContextProps, // Pass OIDC auth context
    url: string,
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
    body: any = null, // Optional body for POST/PUT
    headers: Record<string, string> = {}, // Additional headers
    retry: boolean = true // Allow one retry on 401
): Promise<Response | null> => {
    const token = await getAuthToken(auth);
    if (!token) {
        console.error("No valid token available, logging out...");
        auth.signoutRedirect();
        return null;
    }

    try {
        // ✅ Merge Authorization header with provided headers
        const requestHeaders: Record<string, string> = {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            ...headers,
        };

        // ✅ Prepare request options
        const options: RequestInit = {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : null,
        };

        const response = await fetch(url, options);

        // ✅ If 401, refresh token and retry once
        if (response.status === 401 && retry) {
            console.warn("Unauthorized, retrying with refreshed token...");
            await auth.signinSilent();
            return authRequest(auth, url, method, body, headers, false); // Retry (but only once)
        }

        return response;
    } catch (error) {
        console.error("API request failed:", error);
        return null;
    }
};
