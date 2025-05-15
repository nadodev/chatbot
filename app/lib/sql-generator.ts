import { ChatOpenAI } from "@langchain/openai";
import { PromptTemplate } from "@langchain/core/prompts";

interface TableSchema {
  name: string;
  columns: {
    Field: string;
    Type: string;
    Key?: string;
    Default?: string;
    Extra?: string;
  }[];
  examples?: Record<string, any[]>;
}

export class SQLGenerator {
  private model: ChatOpenAI;
  private tables: TableSchema[] = [];
  
  constructor(apiKey: string) {
    this.model = new ChatOpenAI({
      openAIApiKey: apiKey,
      modelName: "gpt-4-turbo-preview", // Using a capable model for SQL generation
      temperature: 0,
    });
  }

  /**
   * Set database schema for SQL generation
   */
  setDatabaseSchema(schemaData: Record<string, any>) {
    this.tables = [];
    
    // Convert schema format to our internal representation
    for (const [tableName, tableData] of Object.entries(schemaData)) {
      this.tables.push({
        name: tableName,
        columns: tableData.columns || [],
        examples: tableData.sampleData || []
      });
    }
    
    return this;
  }
  
  /**
   * Generate SQL query from natural language question
   */
  async generateSQLQuery(question: string): Promise<{
    sql: string;
    explanation: string;
    relevantTables: string[];
  }> {
    // Create schema description for prompt
    const schemaDescription = this.tables.map(table => {
      const columnsStr = table.columns.map(col => 
        `${col.Field} (${col.Type})${col.Key === 'PRI' ? ' (PRIMARY KEY)' : ''}`
      ).join(", ");
      
      return `Table: ${table.name}\nColumns: ${columnsStr}`;
    }).join("\n\n");
    
    // Create the prompt template with proper formatting
    const templateString = 
    `Você é um especialista em SQL que converte perguntas em linguagem natural para consultas SQL válidas.
    Use apenas as tabelas e colunas fornecidas abaixo.
    
    Schema do banco de dados:
    {schema}
    
    Se a pergunta não puder ser respondida usando estas tabelas, explique por que em vez de gerar SQL.
    Analise cuidadosamente os nomes das tabelas e colunas para encontrar correspondências semânticas.
    
    Por exemplo:
    - Se o usuário perguntar sobre "produtos" e houver uma tabela "Products", use-a.
    - Se o usuário perguntar sobre "perguntas frequentes" e houver uma tabela "FAQ", use-a.
    
    Use alias de tabelas quando apropriado e prefira LEFT JOINs para preservar dados.
    
    Pergunta do usuário: {question}
    
    Responda com:
    1. Uma explicação de quais tabelas e colunas você usará e por quê
    2. A consulta SQL completa que responde à pergunta
    3. Uma lista das tabelas relevantes
    
    Formato:
    \`\`\`explanation
    [sua explicação aqui]
    \`\`\`
    
    \`\`\`sql
    [sua consulta SQL aqui]
    \`\`\`
    
    \`\`\`tables
    [lista de tabelas separadas por vírgulas]
    \`\`\``;
    
    const promptTemplate = PromptTemplate.fromTemplate(templateString);
    
    const formattedPrompt = await promptTemplate.format({
      schema: schemaDescription,
      question
    });
    
    // Generate SQL
    const response = await this.model.invoke(formattedPrompt);
    const content = response.content.toString();
    
    // Extract parts using regex
    const explanationMatch = content.match(/```explanation\s*([\s\S]*?)\s*```/);
    const sqlMatch = content.match(/```sql\s*([\s\S]*?)\s*```/);
    const tablesMatch = content.match(/```tables\s*([\s\S]*?)\s*```/);
    
    const explanation = explanationMatch ? explanationMatch[1].trim() : '';
    const sql = sqlMatch ? sqlMatch[1].trim() : '';
    const relevantTables = tablesMatch 
      ? tablesMatch[1].trim().split(',').map(t => t.trim())
      : [];
    
    return {
      sql,
      explanation,
      relevantTables
    };
  }
} 