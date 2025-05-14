import React from 'react';

interface EmailTemplateProps {
  chatHistory: Array<{ type: 'user' | 'bot', content: string }>;
  userEmail?: string;
  userName?: string;
  timestamp?: string;
}

export const EmailTemplate: React.FC<EmailTemplateProps> = ({
  chatHistory,
  userEmail,
  userName,
  timestamp = new Date().toLocaleString('pt-BR')
}) => {
  return (
    <div style={{
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {/* Cabeçalho */}
      <div style={{
        borderBottom: '2px solid #7c3aed',
        paddingBottom: '20px',
        marginBottom: '20px'
      }}>
        <h1 style={{
          color: '#7c3aed',
          fontSize: '24px',
          margin: '0 0 10px 0'
        }}>
          Histórico do Chat
        </h1>
        {userName && (
          <p style={{ margin: '5px 0', color: '#4b5563' }}>
            <strong>Nome:</strong> {userName}
          </p>
        )}
        {userEmail && (
          <p style={{ margin: '5px 0', color: '#4b5563' }}>
            <strong>Email:</strong> {userEmail}
          </p>
        )}
        <p style={{ margin: '5px 0', color: '#4b5563' }}>
          <strong>Data/Hora:</strong> {timestamp}
        </p>
      </div>

      {/* Conteúdo do Chat */}
      <div style={{ marginBottom: '20px' }}>
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            style={{
              marginBottom: '15px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.type === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div
              style={{
                maxWidth: '80%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: msg.type === 'user' ? '#7c3aed' : '#f3f4f6',
                color: msg.type === 'user' ? '#ffffff' : '#1f2937',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            >
              {msg.content}
            </div>
            <span
              style={{
                fontSize: '12px',
                color: '#6b7280',
                marginTop: '4px'
              }}
            >
              {msg.type === 'user' ? 'Usuário' : 'Assistente'}
            </span>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <div style={{
        borderTop: '1px solid #e5e7eb',
        paddingTop: '20px',
        fontSize: '12px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <p>Este é um email automático gerado pelo sistema de suporte.</p>
        <p>Por favor, não responda a este email.</p>
      </div>
    </div>
  );
};

export default EmailTemplate; 