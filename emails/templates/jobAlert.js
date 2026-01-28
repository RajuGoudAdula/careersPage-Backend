export const jobAlertTemplate = ({ name, job }) => {
    return `
      <p style="font-size:16px;color:#111827;">
        Hello ${name},
      </p>
  
      <p style="font-size:14px;color:#374151;">
        A new job opportunity published on the
        <strong>${job.company} Careers page</strong>
        matches your profile.
      </p>
  
      <!-- Job Card -->
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e7eb;border-radius:6px;margin:20px 0;">
        <tr>
          <td style="padding:16px;">
            <p style="margin:0;font-size:14px;color:#6b7280;">
              ${job.company}
            </p>
            <h2 style="margin:6px 0 12px;font-size:18px;color:#111827;">
              ${job.title}
            </h2>
  
            <p style="margin:4px 0;font-size:14px;">📍 ${job.location}</p>
            <p style="margin:4px 0;font-size:14px;">🕒 ${job.experience} years</p>
            <p style="margin:4px 0;font-size:14px;">🌍 ${job.mode}</p>
  
            <p style="margin-top:12px;font-size:13px;color:#6b7280;">
              Posted on ${job.company} Careers: ${job.posted}
            </p>
  
            <a href="${job.redirectUrl}"
               style="display:inline-block;margin-top:16px;padding:10px 18px;
               background:#2563eb;color:#ffffff;text-decoration:none;
               border-radius:4px;font-size:14px;">
              View job on ${job.company} Careers
            </a>
  
            <p style="margin-top:10px;font-size:12px;color:#6b7280;">
              You’ll be redirected to the official ${job.company} careers page to apply.
            </p>
          </td>
        </tr>
      </table>
  
      <p style="font-size:12px;color:#374151;">
        This job has been sourced directly from the official
        ${job.company} careers portal.
      </p>
    `;
  };
  
 
  