import { NextRequest, NextResponse } from 'next/server';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Cache the MCP client to reuse across requests
let mcpClient: Client | null = null;

async function getMCPClient() {
  if (mcpClient) {
    return mcpClient;
  }

  // Usar variable de entorno si está disponible, sino usar valores por defecto
  const databaseUrl = process.env.DATABASE_URL || 
    'postgresql://postgres:postgres@localhost:5454/northwind';

  const transport = new StdioClientTransport({
    command: 'npx',
    args: [
      '-y',
      '@modelcontextprotocol/server-postgres',
      databaseUrl
    ],
  });

  mcpClient = new Client(
    {
      name: 'postgres-query-client',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  await mcpClient.connect(transport);
  return mcpClient;
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Get or create MCP client
    const client = await getMCPClient();

    // List available tools to find the query tool
    const toolsResponse = await client.listTools();
    
    const queryTool = toolsResponse.tools.find(
      (tool) => tool.name === 'query' || tool.name === 'postgres_query'
    );

    if (!queryTool) {
      return NextResponse.json(
        { error: 'Query tool not found in MCP server' },
        { status: 500 }
      );
    }

    // Execute the query using the tool
    const result = await client.callTool({
      name: queryTool.name,
      arguments: {
        sql: query,
      },
    });

    // Parse the result
    if (!result.content || result.content.length === 0) {
      return NextResponse.json(
        { error: 'No result returned from query' },
        { status: 500 }
      );
    }

    const content = result.content[0];
    
    // The MCP server returns results in different formats
    // Try to parse JSON response
    let queryResult;
    if (content.type === 'text') {
      try {
        queryResult = JSON.parse(content.text);
      } catch {
        // If not JSON, return as is
        queryResult = { rows: [{ result: content.text }], columns: ['result'] };
      }
    } else {
      queryResult = content;
    }

    // Format the response
    if (Array.isArray(queryResult)) {
      // If result is an array of objects
      const columns = queryResult.length > 0 ? Object.keys(queryResult[0]) : [];
      return NextResponse.json({
        columns,
        rows: queryResult,
      });
    } else if (queryResult.rows && Array.isArray(queryResult.rows)) {
      // If result has rows property
      const columns = queryResult.rows.length > 0 
        ? Object.keys(queryResult.rows[0]) 
        : queryResult.columns || [];
      
      return NextResponse.json({
        columns,
        rows: queryResult.rows,
      });
    } else {
      // Fallback: wrap result in array
      const columns = Object.keys(queryResult);
      return NextResponse.json({
        columns,
        rows: [queryResult],
      });
    }

  } catch (error) {
    console.error('Query execution error:', error);
    
    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'An unknown error occurred while executing the query' 
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    const client = await getMCPClient();
    const tools = await client.listTools();
    
    return NextResponse.json({
      status: 'ok',
      message: 'MCP server connected',
      availableTools: tools.tools.map(t => t.name),
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to connect to MCP server',
      },
      { status: 500 }
    );
  }
}

