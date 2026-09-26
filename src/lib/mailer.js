async function SendMail(email, otp) {
  const api_key = process.env.BREVO_API_KEY;
  const url = "https://api.brevo.com/v3/smtp/email";

  const emailData = {
    sender: {
      name: "CERP",
      email: process.env.BREVO_FROM_EMAIL,
    },
    to: [
      {
        email: email,
      },
    ],
    subject: "CERP - Password Reset OTP",
    htmlContent: `
        <div style="font-family: Arial, sans-serif;">
          <h2>Password Reset</h2>

          <p>
            We received a request to reset your CERP password.
          </p>

          <p>Your OTP is:</p>

          <h1 style="letter-spacing: 6px;">
            ${otp}
          </h1>

          <p>
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not request this password reset,
            you can safely ignore this email.
          </p>
        </div>
      `,
  };
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": api_key,
      },
      body: JSON.stringify(emailData),
    });
  } catch (error) {
    console.log(error.message);
  }
}

export default SendMail;
