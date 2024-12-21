#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import axios, { AxiosRequestConfig, Method } from 'axios';

const BASE_URL = process.env.FUNCTION_APP_BASE_URL || 'http://localhost:7071/api';
const AUTH_BASIC_USERNAME = process.env.AUTH_BASIC_USERNAME;
const AUTH_BASIC_PASSWORD = process.env.AUTH_BASIC_PASSWORD;
const AUTH_BEARER = process.env.AUTH_BEARER;
const AUTH_APIKEY_HEADER_NAME = process.env.AUTH_APIKEY_HEADER_NAME;
const AUTH_APIKEY_VALUE = process.env.AUTH_APIKEY_VALUE;

interface TestEndpointArgs {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  body?: any;
  headers?: Record<string, string>;
}

const isValidTestEndpointArgs = (args: any): args is TestEndpointArgs => {
  if (typeof args !== 'object' || args === null) return false;
  if (!['GET', 'POST', 'PUT', 'DELETE'].includes(args.method)) return false;
  if (typeof args.endpoint !== 'string') return false;
  if (args.headers !== undefined && typeof args.headers !== 'object') return false;
  return true;
};

const hasBasicAuth = () => AUTH_BASIC_USERNAME && AUTH_BASIC_PASSWORD;
const hasBearerAuth = () => !!AUTH_BEARER;
const hasApiKeyAuth = () => AUTH_APIKEY_HEADER_NAME && AUTH_APIKEY_VALUE;

class FunctionAppTester {
  private server: Server;
  private axiosInstance;

  constructor() {
    this.server = new Server(
      {
        name: 'function-app-tester',
        version: '0.1.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      validateStatus: () => true, // Allow any status code
    });

    this.setupToolHandlers();
    
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'test_endpoint',
          description: `Test a Function App endpoint and get detailed response information. The endpoint will be prepended to the base url which is: ${BASE_URL}`,
          inputSchema: {
            type: 'object',
            properties: {
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'DELETE'],
                description: 'HTTP method to use',
              },
              endpoint: {
                type: 'string',
                description: 'Endpoint path (e.g. "/users"). Will be appended to base URL.',
              },
              body: {
                type: 'object',
                description: 'Optional request body for POST/PUT requests',
              },
              headers: {
                type: 'object',
                description: 'Optional request headers',
                additionalProperties: {
                  type: 'string',
                },
              },
            },
            required: ['method', 'endpoint'],
          },
        },
      ],
    }));

    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name !== 'test_endpoint') {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${request.params.name}`
        );
      }

      if (!isValidTestEndpointArgs(request.params.arguments)) {
        throw new McpError(
          ErrorCode.InvalidParams,
          'Invalid test endpoint arguments'
        );
      }

      try {
        const config: AxiosRequestConfig = {
          method: request.params.arguments.method as Method,
          url: request.params.arguments.endpoint,
          headers: request.params.arguments.headers || {},
        };

        if (['POST', 'PUT'].includes(request.params.arguments.method) && request.params.arguments.body) {
          config.data = request.params.arguments.body;
        }

        // Handle authentication based on environment variables
        if (hasBasicAuth()) {
          const base64Credentials = Buffer.from(`${AUTH_BASIC_USERNAME}:${AUTH_BASIC_PASSWORD}`).toString('base64');
          config.headers = {
            ...config.headers,
            'Authorization': `Basic ${base64Credentials}`
          };
        } else if (hasBearerAuth()) {
          config.headers = {
            ...config.headers,
            'Authorization': `Bearer ${AUTH_BEARER}`
          };
        } else if (hasApiKeyAuth()) {
          config.headers = {
            ...config.headers,
            [AUTH_APIKEY_HEADER_NAME as string]: AUTH_APIKEY_VALUE
          };
        }

        // Ensure endpoint starts with / and remove any trailing slashes
        const normalizedEndpoint = `/${request.params.arguments.endpoint.replace(/^\/+|\/+$/g, '')}`;
        config.url = normalizedEndpoint;

        const response = await this.axiosInstance.request(config);
        const fullUrl = `${BASE_URL}${normalizedEndpoint}`;

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                url: fullUrl, // Include the actual URL called
                statusCode: response.status,
                statusText: response.statusText,
                headers: response.headers,
                body: response.data,
              }, null, 2),
            },
          ],
        };
      } catch (error) {
        if (axios.isAxiosError(error)) {
          return {
            content: [
              {
                type: 'text',
                text: `Request failed: ${error.message}`,
              },
            ],
            isError: true,
          };
        }
        throw error;
      }
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Function App Tester MCP server running on stdio');
  }
}

const server = new FunctionAppTester();
server.run().catch(console.error);
