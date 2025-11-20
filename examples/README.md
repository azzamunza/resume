# Backend OAuth Integration Examples

This directory contains example files demonstrating how to integrate the backend OAuth server.

## Files

- `backend-oauth-integration.html` - Complete working example with authentication and file editing

## Usage

1. Deploy the backend server (see `../BACKEND_DEPLOYMENT.md`)
2. Update the `BACKEND_API_URL` constant in the HTML file
3. Open the HTML file in a browser (can be served locally)
4. Test authentication and GitHub API integration

## Features Demonstrated

- GitHub OAuth Web Application Flow
- Session-based authentication
- GitHub API proxy usage
- File loading and saving
- Error handling
- UI updates based on auth status

## Testing Locally

```bash
# Serve the example file
python -m http.server 8080

# Open in browser
http://localhost:8080/examples/backend-oauth-integration.html
```

Make sure your backend server is running and the `CALLBACK_URL` includes the correct URL.
