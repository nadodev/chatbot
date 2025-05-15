import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { generateEmailHTML } from '@/app/templates/email-template.html';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { plan, chatResponses } = data;

    // Create a transporter using your email service credentials
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // Format the chat history for the email template
    const chatHistory = [
      { type: 'bot' as const, content: `Plano Selecionado: ${plan.name}` },
      { type: 'bot' as const, content: `Preço: $${plan.price}/mês` },
      { type: 'bot' as const, content: `Empresa: ${chatResponses.company}` },
      { type: 'bot' as const, content: `Necessidades:\n${chatResponses.needs}` }
    ];

    // Generate HTML email using our template
    const html = generateEmailHTML(
      chatHistory,
      chatResponses.email,
      chatResponses.name
    );

    // Send the email
    await transporter.sendMail({
      from: `"Suporte" <${process.env.SMTP_USER}>`,
      to: process.env.SALES_EMAIL,
      subject: `Nova Seleção de Plano ${plan.name}`,
      html,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
} 