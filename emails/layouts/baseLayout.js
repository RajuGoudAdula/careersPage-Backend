export const baseLayout = ({ title, body }) => {
    return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>${title}</title>
      </head>
      <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:24px;">
              
              <!-- Main Card -->
              <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;">
                
                <!-- Header -->
                <tr>
                  <td style="padding:20px;border-bottom:1px solid #e5e7eb;">
                    <div style="font-size:26px;font-weight:700;color:#222;font-family:Arial,sans-serif;">
                      Careers<span style="color:#0071e3;">Page</span>
                    </div>
                    <p style="margin:6px 0 0;font-size:12px;color:#6b7280;">
                      Hiring updates from verified companies
                    </p>
                  </td>
                </tr>
  
                <!-- Body -->
                <tr>
                  <td style="padding:24px;">
                    ${body}
                  </td>
                </tr>
  
                <!-- Footer -->
                <tr>
                  <td style="padding:16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
                    You’re receiving this email because you subscribed to verified job alerts.
                    <br/><br/>
                    © ${new Date().getFullYear()} CareersPage
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
  
  