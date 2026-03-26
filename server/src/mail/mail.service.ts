// server/src/mail/mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.MAIL_PORT || '587'),
      secure: false, 
      auth: {
        user: process.env.MAIL_USER, // Your email
        pass: process.env.MAIL_PASS, // Your app password
      },
    });
  }

  async sendOrderConfirmation(to: string, orderDetails: any) {
    // SECURITY CHECK: Skip if credentials are not configured
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.warn('[MAIL SKIPPED] Email credentials not found in .env. Skipping notification.');
      return;
    }

    const { id, customerName, totalAmount, items } = orderDetails;
    const itemsList = Array.isArray(items) ? items : JSON.parse(items as string);

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
        <h2 style="color: #ff6b35; text-align: center;">Baraka Market</h2>
        <p>Assalomu alaykum, <strong>${customerName}</strong>!</p>
        <p>Buyurtmangiz muvaffaqiyatli qabul qilindi. Tez orada operatorlarimiz siz bilan bog'lanishadi.</p>
        
        <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Buyurtma #${id}</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="border-bottom: 1px solid #ddd;">
                <th style="text-align: left; padding: 8px;">Mahsulot</th>
                <th style="text-align: center; padding: 8px;">Soni</th>
                <th style="text-align: right; padding: 8px;">Narxi</th>
              </tr>
            </thead>
            <tbody>
              ${itemsList.map(item => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px;">${item.name}</td>
                  <td style="text-align: center; padding: 8px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 8px;">$${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="text-align: right; margin-top: 15px; font-weight: bold; font-size: 1.2rem;">
            Jami: $${totalAmount.toLocaleString()}
          </div>
        </div>
        
        <p style="font-size: 0.9rem; color: #666; text-align: center;">
          Xaridingiz uchun rahmat!<br>
          Farg'ona Shahar, Rishton tumani
        </p>
      </div>
    `;

    try {
      await this.transporter.sendMail({
        from: `"Baraka Market" <${process.env.MAIL_USER}>`,
        to: to,
        subject: `Buyurtma tasdiqlandi #${id} - Baraka Market`,
        html: htmlContent,
      });
      console.log(`[MAIL SUCCESS] Order confirmation sent to ${to}`);
    } catch (error) {
      console.error('[MAIL ERROR] Failed to send email:', error);
    }
  }
}
