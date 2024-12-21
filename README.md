# MCP Function App Tester
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A TypeScript-based MCP server that enables testing of Azure Function Apps through Cline. This tool allows you to test and interact with Function App endpoints directly from your development environment.

<a href="https://glama.ai/mcp/servers/la0u86zue0">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/la0u86zue0/badge" />
</a>

## Installation

```bash
npm install dkmaker-mcp-function-app-tester
```

## Features

- Test Function App endpoints with different HTTP methods
- Support for GET, POST, PUT, and DELETE requests
- Detailed response information
- Custom header support
- Request body handling for POST/PUT methods
- Authentication support:
  - Basic Authentication (username/password)
  - Bearer Token Authentication
  - API Key Authentication (custom header)

## Authentication

The server supports two authentication methods that can be configured via environment variables:

### Basic Authentication
Set both environment variables to enable Basic Authentication:
```bash
AUTH_BASIC_USERNAME=your-username
AUTH_BASIC_PASSWORD=your-password
```

### Bearer Token
Set this environment variable to enable Bearer Token authentication:
```bash
AUTH_BEARER=your-token
```

### API Key
Set both environment variables to enable API Key authentication:
```bash
AUTH_APIKEY_HEADER_NAME=X-API-Key  # The header name to use (e.g., X-API-Key, api-key, etc.)
AUTH_APIKEY_VALUE=your-api-key     # The actual API key value
```

Note: Authentication precedence order:
1. Basic Authentication (if username and password are set)
2. Bearer Token (if token is set and Basic Auth is not configured)
3. API Key (if header name and value are set, and no other auth is configured)

## Usage

Once installed, you can use the Function App Tester through Cline. The server provides tools to test endpoints at the base URL: `http://localhost:7071/api`

Example usage:

```typescript
// Test a GET endpoint
{
  "method": "GET",
  "endpoint": "/users"
}

// Test a POST endpoint with body
{
  "method": "POST",
  "endpoint": "/users",
  "body": {
    "name": "John Doe",
    "email": "john@example.com"
  }
}

// Test with custom headers
{
  "method": "GET",
  "endpoint": "/secure/data",
  "headers": {
    "Authorization": "Bearer token123"
  }
}
```

## Development

1. Clone the repository:
```bash
git clone https://github.com/zenturacp/mcp-function-app-tester.git
cd mcp-function-app-tester
```

2. Install dependencies:
```bash
npm install
```

3. Build the project:
```bash
npm run build
```

For development with auto-rebuild:
```bash
npm run watch
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
