// Email utility functions for sending notifications
// This is a placeholder implementation - in a real app, you would integrate with an email service

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  scheduleTitle: string;
  scheduleTime: string;
  type: "upcoming" | "start" | "reminder";
}

export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    // In a real implementation, you would call your email service here
    // For example, using SendGrid, Mailgun, or your own SMTP server

    console.log("📧 Email Notification:", {
      to: emailData.to,
      subject: emailData.subject,
      schedule: emailData.scheduleTitle,
      time: emailData.scheduleTime,
      type: emailData.type,
    });

    // Example implementation with a hypothetical email service:
    /*
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: emailData.to,
        subject: emailData.subject,
        html: emailData.html,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send email');
    }
    */

    // For now, we'll simulate a successful email send
    // In production, replace this with actual email service integration
    await new Promise((resolve) => setTimeout(resolve, 100)); // Simulate network delay

    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

export const createEmailTemplate = (
  type: "upcoming" | "start" | "reminder",
  scheduleTitle: string,
  scheduleTime: string,
  scheduleDescription?: string,
  userEmail?: string
): { subject: string; html: string } => {
  const userName = userEmail?.split("@")[0] || "User";

  let subject = "";
  let html = "";

  switch (type) {
    case "upcoming":
      subject = "⏰ Jadwal Akan Datang - Smart Scheduler AI";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Jadwal Akan Datang</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0; }
            .schedule-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            .highlight { color: #667eea; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Jadwal Akan Datang</h1>
              <p>Smart Scheduler AI</p>
            </div>
            <div class="content">
              <p>Halo <span class="highlight">${userName}</span>,</p>
              <p>Jadwal <strong>${scheduleTitle}</strong> akan dimulai sebentar lagi.</p>
              
              <div class="schedule-info">
                <h3>📅 Detail Jadwal</h3>
                <p><strong>Judul:</strong> ${scheduleTitle}</p>
                <p><strong>Waktu:</strong> ${scheduleTime}</p>
                ${
                  scheduleDescription
                    ? `<p><strong>Deskripsi:</strong> ${scheduleDescription}</p>`
                    : ""
                }
              </div>
              
              <p>Jangan lupa untuk mempersiapkan diri dan pastikan Anda siap untuk menjalankan jadwal ini!</p>
            </div>
            <div class="footer">
              <p>Best regards,<br><strong>Smart Scheduler AI Team</strong></p>
              <p>Email ini dikirim otomatis oleh sistem Smart Scheduler AI</p>
            </div>
          </div>
        </body>
        </html>
      `;
      break;

    case "start":
      subject = "🚀 Jadwal Dimulai - Smart Scheduler AI";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Jadwal Dimulai</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0; }
            .schedule-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #11998e; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            .highlight { color: #11998e; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Jadwal Dimulai</h1>
              <p>Smart Scheduler AI</p>
            </div>
            <div class="content">
              <p>Halo <span class="highlight">${userName}</span>,</p>
              <p>Waktunya untuk menjalankan jadwal <strong>${scheduleTitle}</strong>!</p>
              
              <div class="schedule-info">
                <h3>📅 Detail Jadwal</h3>
                <p><strong>Judul:</strong> ${scheduleTitle}</p>
                <p><strong>Waktu:</strong> ${scheduleTime}</p>
                ${
                  scheduleDescription
                    ? `<p><strong>Deskripsi:</strong> ${scheduleDescription}</p>`
                    : ""
                }
              </div>
              
              <p>Selamat menjalankan jadwal Anda! Semoga hari Anda produktif dan menyenangkan.</p>
            </div>
            <div class="footer">
              <p>Best regards,<br><strong>Smart Scheduler AI Team</strong></p>
              <p>Email ini dikirim otomatis oleh sistem Smart Scheduler AI</p>
            </div>
          </div>
        </body>
        </html>
      `;
      break;

    case "reminder":
      subject = "🔔 Pengingat Jadwal - Smart Scheduler AI";
      html = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Pengingat Jadwal</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; border-radius: 10px; text-align: center; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 10px; margin: 20px 0; }
            .schedule-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f093fb; }
            .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; }
            .highlight { color: #f093fb; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Pengingat Jadwal</h1>
              <p>Smart Scheduler AI</p>
            </div>
            <div class="content">
              <p>Halo <span class="highlight">${userName}</span>,</p>
              <p>Jangan lupa! Jadwal <strong>${scheduleTitle}</strong> akan dimulai sebentar lagi.</p>
              
              <div class="schedule-info">
                <h3>📅 Detail Jadwal</h3>
                <p><strong>Judul:</strong> ${scheduleTitle}</p>
                <p><strong>Waktu:</strong> ${scheduleTime}</p>
                ${
                  scheduleDescription
                    ? `<p><strong>Deskripsi:</strong> ${scheduleDescription}</p>`
                    : ""
                }
              </div>
              
              <p>Pastikan Anda sudah siap dan tidak ada yang terlewat!</p>
            </div>
            <div class="footer">
              <p>Best regards,<br><strong>Smart Scheduler AI Team</strong></p>
              <p>Email ini dikirim otomatis oleh sistem Smart Scheduler AI</p>
            </div>
          </div>
        </body>
        </html>
      `;
      break;
  }

  return { subject, html };
};
