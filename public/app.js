// Pure functional JavaScript for the frontend
let token = localStorage.getItem('jwt_token');

// Helper function to show result
const showResult = (elementId, content, isError = false) => {
    const resultDiv = document.getElementById(elementId);
    resultDiv.innerHTML = `<p class="${isError ? 'error' : 'success'}">${content}</p>`;
};

// Helper function to make API calls
const apiCall = async (url, options = {}) => {
    try {
        const response = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        });
        
        const data = await response.json();
        return { response, data };
    } catch (error) {
        throw new Error(`Request failed: ${error.message}`);
    }
};

// Login functionality
const handleLogin = async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    try {
        const { response, data } = await apiCall('/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        if (response.ok) {
            token = data.token;
            localStorage.setItem('jwt_token', token);
            showResult('loginResult', 'Login successful! Token saved.');
        } else {
            showResult('loginResult', data.error, true);
        }
    } catch (error) {
        showResult('loginResult', error.message, true);
    }
};

// Test protected route
const testProtectedRoute = async () => {
    const currentToken = localStorage.getItem('jwt_token');
    
    if (!currentToken) {
        showResult('protectedResult', 'No token found. Please login first.', true);
        return;
    }
    
    try {
        const { response, data } = await apiCall('/protected', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            showResult('protectedResult', 
                'Protected route accessed successfully!<pre>' + 
                JSON.stringify(data, null, 2) + '</pre>'
            );
        } else {
            showResult('protectedResult', data.error, true);
        }
    } catch (error) {
        showResult('protectedResult', error.message, true);
    }
};

// Test profile route
const testProfileRoute = async () => {
    const currentToken = localStorage.getItem('jwt_token');
    
    if (!currentToken) {
        showResult('profileResult', 'No token found. Please login first.', true);
        return;
    }
    
    try {
        const { response, data } = await apiCall('/profile', {
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });
        
        if (response.ok) {
            showResult('profileResult', 
                'Profile accessed successfully!<pre>' + 
                JSON.stringify(data, null, 2) + '</pre>'
            );
        } else {
            showResult('profileResult', data.error, true);
        }
    } catch (error) {
        showResult('profileResult', error.message, true);
    }
};

// Test token verification
const testTokenVerification = async () => {
    const currentToken = localStorage.getItem('jwt_token');
    
    if (!currentToken) {
        showResult('verifyResult', 'No token found. Please login first.', true);
        return;
    }
    
    try {
        const { response, data } = await apiCall('/verify', {
            method: 'POST',
            body: JSON.stringify({ token: currentToken })
        });
        
        if (response.ok) {
            showResult('verifyResult', 
                data.valid 
                    ? 'Token is valid!<pre>' + JSON.stringify(data.payload, null, 2) + '</pre>'
                    : `Token is invalid: ${data.error}`
            );
        } else {
            showResult('verifyResult', data.error, true);
        }
    } catch (error) {
        showResult('verifyResult', error.message, true);
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
});
