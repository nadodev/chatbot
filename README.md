# Chat App

A customizable chat widget for your website that uses Google AI to provide intelligent responses based on your knowledge base.

## Features

- Create and manage multiple chat widgets
- Customize chat appearance (colors, fonts, position, animations)
- Add knowledge base sources (files and URLs)
- Real-time chat preview
- Easy embed code generation
- Responsive design
- Dark mode support

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Prisma
- MySQL
- Google AI (Gemini)

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/chat-app.git
cd chat-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```
DATABASE_URL="mysql://user:password@localhost:3306/chat_app"
GOOGLE_API_KEY="your-google-api-key"
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
chat-app/
├── app/
│   ├── api/           # API routes
│   ├── components/    # React components
│   ├── dashboard/     # Dashboard pages
│   ├── lib/          # Utility functions
│   └── contexts/     # React contexts
├── prisma/           # Database schema and migrations
├── public/           # Static files
└── uploads/          # Uploaded files
```

## API Routes

- `GET /api/chats` - List all chats
- `POST /api/chats` - Create a new chat
- `GET /api/chats/:id` - Get a specific chat
- `PUT /api/chats/:id` - Update a chat
- `DELETE /api/chats/:id` - Delete a chat
- `GET /api/chats/:id/sources` - List chat sources
- `POST /api/chats/:id/sources` - Add a source
- `DELETE /api/chats/:id/sources` - Delete a source
- `POST /api/upload` - Upload a file
- `POST /api/process-file` - Process an uploaded file
- `POST /api/process-url` - Process a URL
- `POST /api/chat` - Process chat messages

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Nova funcionalidade: Consulta SQL Inteligente

Agora o chat suporta consultas em linguagem natural para bancos de dados utilizando o LangChain:

1. Quando o usuário faz perguntas sobre dados, o sistema usa LangChain para gerar consultas SQL
2. Estas consultas são executadas diretamente no banco de dados
3. Os resultados exatos são retornados para o usuário

### Configuração:

1. Crie um arquivo `.env` na raiz do projeto e adicione sua API key da OpenAI:
```
OPENAI_API_KEY=sua-api-key-aqui
```

2. Reinicie o servidor após adicionar a API key.

### Como usar:

Quando uma fonte de banco de dados for adicionada ao chat, os usuários podem fazer perguntas diretas como:
- "Mostre todos os produtos com preço acima de 100"
- "Quais são as FAQs mais recentes?"
- "Liste todos os clientes do estado de São Paulo"

O sistema irá:
1. Identificar a intenção da pergunta
2. Gerar uma consulta SQL apropriada
3. Executar a consulta no banco de dados
4. Formatar os resultados de maneira amigável para o usuário

### Segurança:

O sistema implementa várias camadas de segurança:
- Valida todas as consultas SQL antes da execução
- Permite apenas operações SELECT
- Bloqueia palavras-chave perigosas
- Implementa timeout para consultas longas
