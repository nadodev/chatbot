import { NextResponse } from 'next/server';
import { sendEmail } from '@/app/lib/email';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { to, subject, chatHistory, userName, userEmail } = body;

    if (!to || !subject || !chatHistory) {
      return NextResponse.json(
        { error: 'Dados incompletos para envio do email' },
        { status: 400 }
      );
    }

    const result = await sendEmail({
      to,
      subject,
      chatHistory,
      userName,
      userEmail,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao processar requisição de email:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar email' },
      { status: 500 }
    );
  }
} 