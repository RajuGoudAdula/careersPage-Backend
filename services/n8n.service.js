import axios from "axios";

const N8N_WEBHOOK_URL =
  process.env.N8N_JOB_WEBHOOK || "http://localhost:5678/webhook-test/job-post";

export const triggerN8nJobAutomation = async ({ job, company }) => {
  try {
    await axios.post(
      N8N_WEBHOOK_URL,
      {
        title: job.title,
        location: job.location,
        experience: job.experience,
        link: `${process.env.FRONTEND_URL}/jobs/${job?._id}`,
        salary: job.salary,
        description: job.description,
        jobType: job.jobType,
        company: {
          companyName: company.companyName,
          companyLogo: company.logo,
        },
        createdAt: job.createdAt,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-WEBHOOK-SECRET": "cp_9FqL7XwA3MZK2eH6R8VYtB5JmU0nDCSx4iPoGa1W",
        },
      }
    );
  } catch (error) {
    console.error(
      "n8n webhook failed:",
      error?.response?.data || error.message
    );
  }
};
