export const Verify_Password_template = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Email Verification</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f8;
        padding: 20px;
      }
      .email-container {
        max-width: 500px;
        margin: auto;
        background-color: #ffffff;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border-top: 8px solid #7e22ce;
      }
      .header {
        background-color: #7e22ce;
        color: white;
        padding: 24px;
        text-align: center;
      }
      .header h1 {
        margin: 0;
        font-size: 22px;
      }
      .content {
        padding: 32px 24px;
        text-align: center;
      }
      .content p {
        font-size: 16px;
        color: #333;
      }
      .otp-box {
        margin: 24px auto;
        font-size: 24px;
        font-weight: bold;
        letter-spacing: 8px;
        color: #7e22ce;
        border: 2px dashed #7e22ce;
        padding: 14px;
        display: inline-block;
        border-radius: 8px;
        background-color: #f9f5ff;
      }
      .footer {
        font-size: 12px;
        color: #999;
        padding: 16px;
        text-align: center;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <h1>Email Verification</h1>
      </div>
      <div class="content">
        <p>Use the following OTP to verify your email address:</p>
        <div class="otp-box"> {VERIFICATION1_CODE2} </div>
        <p>This OTP is valid for 2 minutes. Do not share it with anyone.</p>
      </div>
      <div class="footer">
        &copy; 2025 BizzMate.ai. All rights reserved.
      </div>
    </div>
  </body>
</html>
`;
