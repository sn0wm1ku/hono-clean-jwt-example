// Pure functional JavaScript for the frontend - Cookie-based JWT
// No need to store token in localStorage - browser handles cookies automatically

// Helper function to show result
const showResult = (elementId, content, isError = false) => {
    const resultDiv = document.getElementById(elementId);
    resultDiv.innerHTML = `<p class="${isError ? 'error' : 'success'}">${content}</p>`;
};

// Helper function to make API calls with cookie support
const apiCall = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            credentials: 'include', // Include cookies in requests
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        // Handle different response types
        let data;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            // Handle non-JSON responses (like HTML error pages)
            const text = await response.text();
            data = { error: `Server error: ${response.status} ${response.statusText}` };
        }
        
        return { response, data };
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
};

// Login functionality - now cookie-based
const handleLogin = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const { response, data } = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            // No need to store token - server sets HttpOnly cookie
            showResult('loginResult', `Login successful! Secure cookie set. ${JSON.stringify(data)}`);
        } else {
            showResult('loginResult', data.error, true);
        }
    } catch (error) {
        showResult('loginResult', error.message, true);
    }
};

// Test protected route - now uses automatic cookie authentication
const testProtectedRoute = async () => {
    try {
        const { response, data } = await apiCall('/user/protected');
        
        if (response.ok) {
            showResult('protectedResult', 
                'Protected route accessed successfully!<pre>' + 
                JSON.stringify(data, null, 2) + '</pre>'
            );
        } else if (response.status === 401) {
            showResult('protectedResult', 'Authentication required. Please login first.', true);
        } else {
            showResult('protectedResult', data.error || `Error: ${response.status} ${response.statusText}`, true);
        }
    } catch (error) {
        showResult('protectedResult', error.message, true);
    }
};

// Test profile route - now uses automatic cookie authentication
const testProfileRoute = async () => {
    try {
        const { response, data } = await apiCall('/user/profile');
        
        if (response.ok) {
            showResult('profileResult', 
                'Profile accessed successfully!<pre>' + 
                JSON.stringify(data, null, 2) + '</pre>'
            );
        } else if (response.status === 401) {
            showResult('profileResult', 'Authentication required. Please login first.', true);
        } else {
            showResult('profileResult', data.error || `Error: ${response.status} ${response.statusText}`, true);
        }
    } catch (error) {
        showResult('profileResult', error.message, true);
    }
};

// Test token verification - simplified for cookie auth
const testTokenVerification = async () => {
    try {
        // For cookie auth, we'll test by accessing a protected route
        // Since we can't access the HttpOnly cookie from JavaScript
        const { response, data } = await apiCall('/user/protected');
        
        if (response.ok) {
            showResult('verifyResult', 
                'Cookie authentication is valid!<pre>' + 
                JSON.stringify(data, null, 2) + '</pre>'
            );
        } else if (response.status === 401) {
            showResult('verifyResult', 'Cookie authentication failed. Please login.', true);
        } else {
            showResult('verifyResult', data.error || `Error: ${response.status} ${response.statusText}`, true);
        }
    } catch (error) {
        showResult('verifyResult', error.message, true);
    }
};

// Logout functionality to clear cookie
const handleLogout = async () => {
    try {
        const { response, data } = await apiCall('/auth/logout', {
            method: 'POST'
        });
        
        if (response.ok) {
            showResult('loginResult', 'Logged out successfully!');
            // Clear any displayed results
            showResult('protectedResult', '');
            showResult('profileResult', '');
            showResult('verifyResult', '');
        } else {
            showResult('loginResult', data.error || 'Logout failed', true);
        }
    } catch (error) {
        showResult('loginResult', error.message, true);
    }
};

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Make functions available globally for onclick handlers
    window.testProtectedRoute = testProtectedRoute;
    window.testProfileRoute = testProfileRoute;
    window.testTokenVerification = testTokenVerification;
    window.handleLogout = handleLogout;
});
