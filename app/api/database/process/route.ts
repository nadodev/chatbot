import { NextResponse } from 'next/server';
import mysql, { RowDataPacket } from 'mysql2/promise';

interface SchemaData {
  [key: string]: {
    columns: RowDataPacket[];
    sampleData: RowDataPacket[];
  };
}

export async function POST(request: Request) {
  try {
    const { connectionString, tables } = await request.json();

    if (!connectionString) {
      return NextResponse.json(
        { message: 'String de conexão não fornecida' },
        { status: 400 }
      );
    }

    // Conectar ao banco
    const connection = await mysql.createConnection(connectionString);

    if (tables) {
      // Se tabelas específicas foram solicitadas, retornar schema delas
      const schema: SchemaData = {};
      for (const table of tables) {
        const [columns] = await connection.query<RowDataPacket[]>(`DESCRIBE ${table}`);
        const [sampleData] = await connection.query<RowDataPacket[]>(`SELECT * FROM ${table} LIMIT 3`);
        
        schema[table] = {
          columns,
          sampleData
        };
      }
      
      await connection.end();
      return NextResponse.json({ schema });
    } else {
      // Se não foram especificadas tabelas, retornar lista de tabelas
      const [result] = await connection.query<RowDataPacket[]>('SHOW TABLES');
      await connection.end();

      const tables = result.map(row => Object.values(row)[0] as string);

      return NextResponse.json({ tables });
    }
  } catch (error) {
    console.error('Erro ao processar banco de dados:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Erro ao processar banco de dados' },
      { status: 500 }
    );
  }
} 