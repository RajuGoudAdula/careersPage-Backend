export const jobAlertTemplate = ({ name, jobs }) => {
  if (!jobs || jobs.length === 0) return "";

  // SVG icons matching your design
  const getJobTypeIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "remote":
        return `<svg height="16" viewBox="0 -960 960 960" width="16" fill="#434343"><path d="M480.28-96Q401-96 331-126t-122.5-82.5Q156-261 126-330.96t-30-149.5Q96-560 126-629.5q30-69.5 82.5-122T330.96-834q69.96-30 149.5-30t149.04 30q69.5 30 122 82.5T834-629.28q30 69.73 30 149Q864-401 834-331t-82.5 122.5Q699-156 629.28-126q-69.73 30-149 30Zm-.28-72q122 0 210-81t100-200q-9 8-20.5 12.5T744-432H600q-29.7 0-50.85-21.15Q528-474.3 528-504v-48H360v-96q0-29.7 21.15-50.85Q402.3-720 432-720h48v-24q0-14 5-26t13-21q-3-1-10-1h-8q-130 0-221 91t-91 221h216q60 0 102 42t42 102v48H384v105q23 8 46.73 11.5Q454.45-168 480-168Z"/></svg>`;
      case "full-time":
        return `<svg height="16" viewBox="0 -960 960 960" width="16" fill="#434343"><path d="M168-144q-29.7 0-50.85-21.15Q96-186.3 96-216v-432q0-29.7 21.15-50.85Q138.3-720 168-720h168v-72.21Q336-822 357.18-843q21.17-21 50.91-21h144.17Q582-864 603-842.85q21 21.15 21 50.85v72h168q29.7 0 50.85 21.15Q864-677.7 864-648v432q0 29.7-21.15 50.85Q821.7-144 792-144H168Zm0-72h624v-432H168v432Zm240-504h144v-72H408v72ZM168-216v-432 432Z"/></svg>`;
      case "part-time":
        return `<svg height="16" viewBox="0 -960 960 960" width="16" fill="#434343"><path d="M216-600h528v-96H216v96Zm0 0v-96 96Zm0 504q-29.7 0-50.85-21.15Q144-138.3 144-168v-528q0-29 21.5-50.5T216-768h72v-96h72v96h240v-96h72v96h72q29 0 50.5 21.5T816-696v210q-17-7-35.03-11-18.04-4-36.97-6v-25H216v360h250q5 20 13.5 37.5T499-96H216Zm503.77 48Q640-48 584-104.23q-56-56.22-56-136Q528-320 584.23-376q56.22-56 136-56Q800-432 856-375.77q56 56.22 56 136Q912-160 855.77-104q-56.22 56-136 56ZM775-151l34-34-65-65v-86h-48v106l79 79Z"/></svg>`;
      case "internship":
        return `<svg height="16" viewBox="0 -960 960 960" width="16" fill="#434343"><path d="M480-144 216-276v-240L48-600l432-216 432 216v312h-72v-276l-96 48v240L480-144Zm0-321 271-135-271-135-271 135 271 135Zm0 240 192-96v-159l-192 96-192-96v159l192 96Zm0-240Zm0 81Zm0 0Z"/></svg>`;
      default:
        return `<svg height="16" viewBox="0 0 24 24" width="16" fill="#434343"><path d="M10 2h4v2h5a1 1 0 0 1 1 1v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a1 1 0 0 1 1-1h5V2z" /></svg>`;
    }
  };

  // Generate HTML for each job
  const jobCardsHtml = jobs.map((job) => {
    const companyName = job?.company?.companyName || "Company";
    const logo = job?.company?.logo || "https://via.placeholder.com/48";
    const timeAgo = job?.createdAt ? getTimeAgo(job.createdAt) : "Recently";
  
    return `
    <!-- Job Card -->
    <table width="100%" cellpadding="0" cellspacing="0"
      style="
        background:#ffffff;
        border:1px solid rgba(0,0,0,0.06);
        border-radius:16px;
        box-shadow:0 4px 14px rgba(0,0,0,0.04);
        margin-bottom:16px;
      ">
      <tr>
        <td style="padding:16px;">
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <!-- Logo -->
              <td width="48" valign="top">
                <img src="${logo}"
                  width="40"
                  height="40"
                  style="display:block;border-radius:10px;" />
              </td>
  
              <!-- Content -->
              <td valign="top" style="padding-left:12px;">
                <p style="margin:0;font-size:14px;font-weight:600;color:#111827;">
                  ${job.title}
                </p>
  
                <p style="margin:4px 0 10px;font-size:13px;font-weight:500;color:#2563eb;">
                  ${companyName}
                </p>
  
                <!-- Meta -->
                <table cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding-right:14px;font-size:13px;color:#6e6e73;white-space:nowrap;">
                      📍 ${job.location}
                    </td>
                    <td style="padding-right:14px;font-size:13px;color:#6e6e73;white-space:nowrap;">
                      🕒 ${job.experience} ${job.experience <= 1 ? "year" : "years"}
                    </td>
                    <td style="font-size:13px;color:#6e6e73;white-space:nowrap;">
                      ${getJobTypeIcon(job.jobType)}
                      <span style="vertical-align:middle;">${job.jobType}</span>
                    </td>
                  </tr>
                </table>
              </td>
  
              <!-- CTA -->
              <td align="right" valign="top">
                <a href="${job.link}"
                  style="
                    display:inline-block;
                    padding:6px 10px;
                    font-size:12px;
                    font-weight:600;
                    color:#2563eb;
                    background:rgba(37,99,235,0.08);
                    border:1px solid rgba(37,99,235,0.18);
                    border-radius:5px;
                    text-decoration:none;
                  ">
                  View Job →
                </a>
              </td>
            </tr>
  
            <!-- Footer -->
            <tr>
              <td></td>
              <td colspan="2"
                style="
                  padding-top:10px;
                  margin-top:10px;
                  border-top:1px solid rgba(0,0,0,0.06);
                ">
                <span style="font-size:12px;font-weight:500;color:#86868b;">
                  Posted ${timeAgo}
                </span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
    `;
  }).join("");
  


  // Helper function to calculate time ago
  function getTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  // Main email wrapper
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your Job Alerts - CareersPage</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght=300;400;500;600;700&display=swap" rel="stylesheet">
    </head>
    <body style="margin:0; padding:0; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #ffffff;">
      <!-- Email Container -->
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td align="center">
            <!-- Main Content -->
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto;">
              <!-- Header -->
              <tr>
                <td style="padding: 32px 24px; background: #ffffff; border-bottom: 1px solid #f3f4f6;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td>
                        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #111827;">
                          CareersPage
                        </h1>
                        <p style="margin: 8px 0 0; font-size: 14px; color: #6b7280; font-style: italic;">
                          JOB PORTALS DON'T RESPOND. COMPANIES DO.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              
              <!-- Hero Section -->
              <tr>
                <td style="padding: 40px 24px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); text-align: center;">
                  <p style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #111827;">
                    Hello ${name},
                  </p>
                  <p style="margin: 0 0 24px; font-size: 14px; color: #4b5563; line-height: 1.6;">
                    Apply once, reach real company career pages — and get notified instantly.
                  </p>
                  <p style="margin: 0; font-size: 16px; font-weight: 600; color: #111827;">
                    Here are ${jobs.length} job${jobs.length > 1 ? 's' : ''} that match your preferences:
                  </p>
                </td>
              </tr>
              
              <!-- Job Cards -->
              <tr>
                <td style="padding: 32px 24px;">
                  ${jobCardsHtml}
                </td>
              </tr>
              
              <!-- CTA Section -->
              <tr>
                <td style="padding: 0 24px 40px; text-align: center;">
                  <a href="https://your-app-url.com/dashboard"
                     style="display: inline-block; padding: 14px 32px; background: #111827; color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
                    Start Applying
                  </a>
                  <p style="margin: 20px 0 0; font-size: 13px; color: #6b7280;">
                    View more jobs and manage your alerts in your dashboard
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 32px 24px; background: #f9fafb; border-top: 1px solid #e5e7eb;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center">
                        <p style="margin: 0 0 12px; font-size: 13px; color: #6b7280;">
                          All jobs are sourced directly from official company career portals.
                        </p>
                        <p style="margin: 0 0 8px; font-size: 12px; color: #9ca3af;">
                          With CareersPage, you apply directly to companies — not portals.
                        </p>
                        <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                          © ${new Date().getFullYear()} CareersPage. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
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