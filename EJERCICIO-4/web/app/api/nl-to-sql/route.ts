import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Interfaces para el esquema
interface ColumnInfo {
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
}

interface TableInfo {
  table_name: string;
  columns: ColumnInfo[];
}

interface RelationInfo {
  table_name: string;
  column_name: string;
  foreign_table_name: string;
  foreign_column_name: string;
}

// Cache del esquema de la base de datos
let cachedSchema: string | null = null;
let schemaTimestamp: number = 0;
const SCHEMA_CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Cliente MCP para introspección de base de datos
async function getMCPClient() {
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

  const client = new Client(
    {
      name: 'schema-introspection-client',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  await client.connect(transport);
  return client;
}

// Obtener el esquema de la base de datos usando MCP
async function getDatabaseSchema(): Promise<string> {
  // Verificar cache
  const now = Date.now();
  if (cachedSchema && (now - schemaTimestamp) < SCHEMA_CACHE_DURATION) {
    return cachedSchema;
  }

  try {
    const client = await getMCPClient();
    const queryTool = (await client.listTools()).tools.find(
      (tool) => tool.name === 'query' || tool.name === 'postgres_query'
    );

    if (!queryTool) {
      throw new Error('Query tool not found in MCP server');
    }

    // Consulta para obtener todas las tablas y sus columnas
    const schemaQuery = `
      SELECT 
        t.table_name,
        json_agg(
          json_build_object(
            'column_name', c.column_name,
            'data_type', c.data_type,
            'is_nullable', c.is_nullable,
            'column_default', c.column_default
          ) ORDER BY c.ordinal_position
        ) as columns
      FROM information_schema.tables t
      JOIN information_schema.columns c 
        ON t.table_name = c.table_name 
        AND t.table_schema = c.table_schema
      WHERE t.table_schema = 'public' 
        AND t.table_type = 'BASE TABLE'
      GROUP BY t.table_name
      ORDER BY t.table_name;
    `;

    const result = await client.callTool({
      name: queryTool.name,
      arguments: { sql: schemaQuery },
    });

    // Consulta para obtener relaciones (foreign keys)
    const relationQuery = `
      SELECT
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
        AND ccu.table_schema = tc.table_schema
      WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
      ORDER BY tc.table_name, kcu.column_name;
    `;

    const relationsResult = await client.callTool({
      name: queryTool.name,
      arguments: { sql: relationQuery },
    });

    // Parsear resultados
    let tables: TableInfo[] = [];
    let relations: RelationInfo[] = [];

    if (result.content && Array.isArray(result.content) && result.content.length > 0) {
      const schemaContent = result.content[0];
      if (schemaContent.type === 'text') {
        try {
          tables = JSON.parse(schemaContent.text) as TableInfo[];
        } catch {
          tables = [];
        }
      }
    }

    if (relationsResult.content && Array.isArray(relationsResult.content) && relationsResult.content.length > 0) {
      const relationsContent = relationsResult.content[0];
      if (relationsContent.type === 'text') {
        try {
          relations = JSON.parse(relationsContent.text) as RelationInfo[];
        } catch {
          relations = [];
        }
      }
    }

    // Construir el esquema en formato legible
    let schemaText = 'Base de datos: PostgreSQL\n\nTablas y sus columnas:\n\n';
    
    tables.forEach((table: TableInfo, index: number) => {
      schemaText += `${index + 1}. ${table.table_name}\n`;
      const columns = table.columns || [];
      columns.forEach((col: ColumnInfo) => {
        schemaText += `   - ${col.column_name} (${col.data_type})`;
        if (col.is_nullable === 'NO') schemaText += ' NOT NULL';
        schemaText += '\n';
      });
      schemaText += '\n';
    });

    if (relations.length > 0) {
      schemaText += 'Relaciones (Foreign Keys):\n';
      relations.forEach((rel: RelationInfo) => {
        schemaText += `- ${rel.table_name}.${rel.column_name} -> ${rel.foreign_table_name}.${rel.foreign_column_name}\n`;
      });
    }

    // Actualizar cache
    cachedSchema = schemaText;
    schemaTimestamp = now;

    return schemaText;
  } catch (error) {
    console.error('Error getting database schema:', error);
    // Fallback a un esquema básico si falla
    return 'Base de datos: PostgreSQL\nTablas principales: customers, products, orders, order_details, categories, suppliers, employees';
  }
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

    // Verificar que la API key de Anthropic esté configurada
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { 
          error: 'API key de Anthropic no configurada',
          message: 'Por favor configura ANTHROPIC_API_KEY en las variables de entorno'
        },
        { status: 500 }
      );
    }

    // Obtener el esquema de la base de datos usando MCP
    const databaseSchema = await getDatabaseSchema();

    // Crear cliente de Anthropic
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    // Construir el prompt para Claude
    const systemPrompt = `Eres un experto en SQL y bases de datos PostgreSQL. Tu tarea es convertir consultas en lenguaje natural a SQL válido.

${databaseSchema}

Reglas importantes:
1. Genera SOLO la consulta SQL, sin explicaciones adicionales
2. Usa PostgreSQL syntax
3. Usa LIMIT para limitar resultados (máximo 100 rows por defecto)
4. Usa nombres de tabla y columna en minúsculas
5. Para búsquedas de texto, usa ILIKE para case-insensitive
6. Siempre incluye las columnas más relevantes
7. Ordena los resultados de forma lógica cuando sea apropiado
8. Si la consulta es ambigua, asume la interpretación más común`;

    const userPrompt = `Convierte esta consulta en lenguaje natural a SQL:

"${query}"

Responde ÚNICAMENTE con la consulta SQL, sin markdown, sin explicaciones, solo el código SQL.`;

    // Llamar a Claude
    const message = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      system: systemPrompt,
    });

    // Extraer el SQL generado
    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json(
        { error: 'Respuesta inesperada del modelo' },
        { status: 500 }
      );
    }

    let sqlQuery = content.text.trim();
    
    // Limpiar el SQL de posibles markdown o formatting
    sqlQuery = sqlQuery
      .replace(/^```sql\n?/i, '')
      .replace(/^```\n?/i, '')
      .replace(/\n?```$/i, '')
      .trim();

    // Asegurar que termina con punto y coma
    if (!sqlQuery.endsWith(';')) {
      sqlQuery += ';';
    }

    return NextResponse.json({
      sql: sqlQuery,
      model: 'claude-3-7-sonnet-20250219',
    });

  } catch (error) {
    console.error('Error converting natural language to SQL:', error);
    
    if (error instanceof Anthropic.APIError) {
      return NextResponse.json(
        { 
          error: 'Error al comunicarse con Claude',
          message: error.message,
        },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json(
      { 
        error: error instanceof Error 
          ? error.message 
          : 'Error desconocido al convertir la consulta'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para ver el esquema actual
export async function GET() {
  try {
    const schema = await getDatabaseSchema();
    
    return NextResponse.json({
      status: 'ok',
      schema: schema,
      cached: cachedSchema !== null,
      cacheAge: cachedSchema ? Math.floor((Date.now() - schemaTimestamp) / 1000) : 0,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: error instanceof Error ? error.message : 'Failed to get database schema',
      },
      { status: 500 }
    );
  }
}
