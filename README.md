# Azure Table Storage MCP Server

A TypeScript-based MCP server that enables interaction with Azure Table Storage directly through Cline. This tool allows you to query and manage data in Azure Storage Tables.

<a href="https://glama.ai/mcp/servers/la0u86zue0">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/la0u86zue0/badge" />
</a>

## Features

- Query Azure Storage Tables with OData filter support
- Get table schemas to understand data structure
- List all tables in the storage account
- Detailed error handling and response information
- Simple configuration through connection string

## Installation

### Local Development Setup

1. Clone the repository:
```powershell
git clone https://github.com/zenturacp/mcp-azure-tablestorage.git
cd mcp-azure-tablestorage
```

2. Install dependencies:
```powershell
npm install
```

3. Build the server:
```powershell
npm run build
```

For development with auto-rebuild:
```powershell
npm run watch
```

### Installing in Cline

To use the Azure Table Storage server with Cline, you need to add it to your MCP settings configuration. The configuration file is located at:

Windows: `%APPDATA%\Code\User\globalStorage\saoudrizwan.claude-dev\settings\cline_mcp_settings.json`

Add the following to your configuration:

```json
{
  "mcpServers": {
    "tablestore": {
      "command": "node",
      "args": ["C:/path/to/your/mcp-azure-tablestorage/build/index.js"],
      "env": {
        "AZURE_STORAGE_CONNECTION_STRING": "your_connection_string_here"  // Required: Your Azure Storage connection string
      }
    }
  }
}
```

Replace `C:/path/to/your/mcp-azure-tablestorage` with the actual path where you cloned the repository.

## Configuration

The server uses the following environment variables:

- `AZURE_STORAGE_CONNECTION_STRING`: Your Azure Storage account connection string

## Usage in Cline

Once installed, you can use the Azure Table Storage server through Cline. Here are some examples:

1. Querying a table:
```
Query the Users table where PartitionKey is 'ACTIVE'
```

Cline will use the query_table tool with:
```json
{
  "tableName": "Users",
  "filter": "PartitionKey eq 'ACTIVE'"
}
```

2. Getting table schema:
```
Show me the schema for the Orders table
```

Cline will use the get_table_schema tool with:
```json
{
  "tableName": "Orders"
}
```

3. Listing tables:
```
List all tables in the storage account
```

Cline will use the list_tables tool with:
```json
{}
```

## Development

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. The project includes the MCP Inspector for debugging:

```powershell
npm run inspector
```

This will provide a URL to access debugging tools in your browser.

### Project Structure

- `src/index.ts`: Main server implementation with Azure Table Storage interaction logic
- `build/`: Compiled JavaScript output
- `package.json`: Project dependencies and scripts
