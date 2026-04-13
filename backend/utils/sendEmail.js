const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    try {
        // Tạo transporter dựa trên biến môi trường từ .env
        const transporter = nodemailer.createTransport({
            service: 'gmail', // Hoặc custom SMTP (host, port)
            auth: {
                user: process.env.EMAIL_USER.trim(),
                pass: process.env.EMAIL_PASS.trim()
            }
        });

        // Tùy chọn gửi email
        const mailOptions = {
            from: `V&T Nexis <${process.env.EMAIL_USER.trim()}>`,
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        // Gửi email
        const info = await transporter.sendMail(mailOptions);
        return { success: true };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = sendEmail;
