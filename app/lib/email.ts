import nodemailer from 'nodemailer';
import { generateEmailHTML } from '../templates/email-template.html';

// Configuração do transporter do Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  chatHistory: Array<{ type: 'user' | 'bot', content: string }>;
  userName?: string;
  userEmail?: string;
}

export const sendEmail = async ({
  to,
  subject,
  chatHistory,
  userName,
  userEmail,
}: SendEmailParams) => {
  try {
    const html = generateEmailHTML(chatHistory, userEmail, userName);

    const mailOptions = {
      from: `"Suporte" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
};

export default sendEmail; 