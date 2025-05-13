import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { plan, chatResponses, email } = data;

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

    // Format the email content
    const emailContent = `
      New Plan Selection:
      
      Plan: ${plan.name}
      Price: $${plan.price}/month
      
      Customer Information:
      Name: ${chatResponses.name}
      Email: ${chatResponses.email}
      Company: ${chatResponses.company}
      
      Needs:
      ${chatResponses.needs}
    `;

    // Send the email
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SALES_EMAIL,
      subject: `New ${plan.name} Plan Selection`,
      text: emailContent,
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