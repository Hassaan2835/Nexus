const { Resend } = require('resend');

const sendEmail = async (options) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || `<p>${options.message}</p>`,
    });

    if (error) {
      throw error;
    }

    console.log('Email sent successfully via Resend:', data.id);
  } catch (err) {
    console.error('Resend Error:', err);
    // Print OTP to console as fallback for development
    console.log('--- FALLBACK: OTP for', options.email, '---');
    console.log(options.message);
    console.log('------------------------------------------');
    // We don't necessarily want to crash the request if email fails in dev,
    // but we should know it failed.
  }
};

module.exports = sendEmail;
