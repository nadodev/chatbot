export const generateEmailHTML = (
  chatHistory: Array<{ type: 'user' | 'bot', content: string }>,
  userEmail?: string,
  userName?: string,
  timestamp: string = new Date().toLocaleString('pt-BR')
) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Histórico do Chat</title>
      </head>
      <body style="
        margin: 0;
        padding: 0;
        font-family: Arial, sans-serif;
        background-color: #f3f4f6;
      ">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              <table width="600" cellpadding="0" cellspacing="0" style="
                background-color: #ffffff;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                margin: 0 auto;
              ">
                <!-- Cabeçalho -->
                <tr>
                  <td style="
                    padding: 30px;
                    border-bottom: 2px solid #7c3aed;
                  ">
                    <h1 style="
                      color: #7c3aed;
                      font-size: 24px;
                      margin: 0 0 20px 0;
                      text-align: center;
                    ">
                      Histórico do Chat
                    </h1>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${userName ? `
                        <tr>
                          <td style="padding: 5px 0; color: #4b5563;">
                            <strong>Nome:</strong> ${userName}
                          </td>
                        </tr>
                      ` : ''}
                      ${userEmail ? `
                        <tr>
                          <td style="padding: 5px 0; color: #4b5563;">
                            <strong>Email:</strong> ${userEmail}
                          </td>
                        </tr>
                      ` : ''}
                      <tr>
                        <td style="padding: 5px 0; color: #4b5563;">
                          <strong>Data/Hora:</strong> ${timestamp}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Conteúdo do Chat -->
                <tr>
                  <td style="padding: 30px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      ${chatHistory.map((msg, index) => `
                        <tr>
                          <td style="padding: 10px 0;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td align="${msg.type === 'user' ? 'right' : 'left'}">
                                  <div style="
                                    display: inline-block;
                                    max-width: 80%;
                                    padding: 12px 16px;
                                    border-radius: 12px;
                                    background-color: ${msg.type === 'user' ? '#7c3aed' : '#f3f4f6'};
                                    color: ${msg.type === 'user' ? '#ffffff' : '#1f2937'};
                                    font-size: 14px;
                                    line-height: 1.5;
                                  ">
                                    ${msg.content}
                                  </div>
                                </td>
                              </tr>
                              <tr>
                                <td align="${msg.type === 'user' ? 'right' : 'left'}" style="padding-top: 4px;">
                                  <span style="
                                    font-size: 12px;
                                    color: #6b7280;
                                    display: ${msg.type === 'user' ? 'block' : 'none'};
                                  ">
                                    ${msg.type === 'user' ? 'Usuário' : ''}
                                  </span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      `).join('')}
                    </table>
                  </td>
                </tr>

                <!-- Rodapé -->
                <tr>
                  <td style="
                    padding: 20px 30px;
                    border-top: 1px solid #e5e7eb;
                    text-align: center;
                    font-size: 12px;
                    color: #6b7280;
                  ">
                    <p style="margin: 5px 0;">Este é um email automático gerado pelo sistema de suporte.</p>
                    <p style="margin: 5px 0;">Por favor, não responda a este email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
};

export default generateEmailHTML; 