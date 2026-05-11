const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Kiểm tra biến môi trường
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('Thiếu EMAIL_USER hoặc EMAIL_PASS');
    }

    try {
        // Cấu hình transporter cho Gmail SMTP
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // dùng STARTTLS
            auth: {
                user: process.env.EMAIL_USER.trim(),
                pass: process.env.EMAIL_PASS.trim()
            },

            // QUAN TRỌNG:
            // Ép dùng IPv4 để tránh lỗi ENETUNREACH trên Render
            family: 4,

            tls: {
                rejectUnauthorized: false
            }
        });

        // Nội dung email
        const mailOptions = {
            from: `"V&T Nexis" <${process.env.EMAIL_USER.trim()}>`,
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        // Gửi email
        const info = await transporter.sendMail(mailOptions);

        console.log('Email gửi thành công:', info.response);

        return info;

    } catch (error) {
        console.error('LỖI GỬI MAIL NODEMAILER:', error);
        throw error;
    }
};

module.exports = sendEmail;