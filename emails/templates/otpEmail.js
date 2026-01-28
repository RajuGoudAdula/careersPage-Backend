export const otpEmailTemplate = ({ name, otp, expiresIn }) => {
    return `
      <p style="font-size:16px;color:#111827;">
        Hello ${name},
      </p>
  
      <p style="font-size:14px;color:#374151;">
        Use the verification code below to confirm your email address on
        <strong>CareersPage</strong>.
      </p>
  
      <!-- OTP Box -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">
        <tr>
          <td align="center"
              style="border:1px dashed #d1d5db;
                     padding:20px;
                     font-size:28px;
                     letter-spacing:6px;
                     font-weight:600;
                     color:#111827;">
            ${otp}
          </td>
        </tr>
      </table>
  
      <p style="font-size:13px;color:#374151;">
        This code will expire in <strong>${expiresIn} minutes</strong>.
      </p>
  
      <p style="font-size:12px;color:#6b7280;margin-top:16px;">
        If you did not request this verification, please ignore this email.
        For security reasons, do not share this code with anyone.
      </p>
    `;
  };
  

  