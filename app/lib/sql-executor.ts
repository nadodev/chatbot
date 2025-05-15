import mysql from 'mysql2/promise';

export class SQLExecutor {
  private connectionString: string;
  private connection: mysql.Connection | null = null;
  // Lista branca de operações permitidas
  private allowedOperations = ['SELECT'];
  // Lista negra de palavras-chave perigosas
  private blockedKeywords = [
    'DROP', 'DELETE', 'TRUNCATE', 'UPDATE', 'INSERT', 
    'ALTER', 'CREATE', 'RENAME', 'REPLACE', 'PROCEDURE',
    'FUNCTION', 'TRIGGER'
  ];
  
  constructor(connectionString: string) {
    this.connectionString = connectionString;
  }
  
  /**
   * Conecta ao banco de dados
   */
  async connect(): Promise<void> {
    if (!this.connection) {
      this.connection = await mysql.createConnection(this.connectionString);
    }
  }
  
  /**
   * Fecha a conexão com o banco de dados
   */
  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.end();
      this.connection = null;
    }
  }

  /**
   * Verifica se a consulta SQL é segura
   */
  private isQuerySafe(query: string): boolean {
    // Normaliza a consulta removendo espaços extras e convertendo para maiúsculas
    const normalizedQuery = query.replace(/\s+/g, ' ').toUpperCase();
    
    // Verifica se a consulta começa com uma operação permitida
    const startsWithAllowed = this.allowedOperations.some(op => 
      normalizedQuery.trim().startsWith(op)
    );
    
    if (!startsWithAllowed) {
      console.warn(`Consulta rejeitada: Não começa com uma operação permitida: ${query}`);
      return false;
    }
    
    // Verifica se a consulta contém palavras-chave bloqueadas
    const containsBlocked = this.blockedKeywords.some(keyword => {
      // Verifica se a palavra-chave está presente como uma palavra completa
      // usando regex com limites de palavra
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(normalizedQuery);
    });
    
    if (containsBlocked) {
      console.warn(`Consulta rejeitada: Contém palavra-chave bloqueada: ${query}`);
      return false;
    }
    
    return true;
  }
  
  /**
   * Executa uma consulta SQL com verificação de segurança
   */
  async executeQuery(sql: string): Promise<{ results: any[]; error?: string }> {
    try {
      if (!this.isQuerySafe(sql)) {
        return { 
          results: [],
          error: "Consulta SQL rejeitada por motivos de segurança. Apenas consultas SELECT são permitidas."
        };
      }
      
      await this.connect();
      
      if (!this.connection) {
        throw new Error("Não foi possível estabelecer conexão com o banco de dados");
      }
      
      // Define um timeout para consultas longas (30 segundos)
      const queryTimeout = 30000;
      const timeoutPromise = new Promise<any>((_, reject) => {
        setTimeout(() => reject(new Error("Timeout da consulta excedido")), queryTimeout);
      });
      
      // Executa a consulta com timeout
      const queryPromise = this.connection.query(sql);
      const [result] = await Promise.race([queryPromise, timeoutPromise]);
      
      return { results: result };
    } catch (error: any) {
      console.error("Erro ao executar consulta SQL:", error);
      return {
        results: [],
        error: `Erro ao executar consulta SQL: ${error.message}`
      };
    }
  }
} 