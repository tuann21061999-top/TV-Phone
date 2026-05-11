const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    if (!process.env.BREVO_EMAIL || !process.env.BREVO_SMTP_KEY) {
        throw new Error('Thiếu BREVO_EMAIL hoặc BREVO_SMTP_KEY');
    }

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp-relay.brevo.com',
            port: 587,
            secure: false,

            auth: {
                user: process.env.BREVO_EMAIL.trim(),
                pass: process.env.BREVO_SMTP_KEY.trim()
            },

            name: 'V&T Nexis',

            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000,

            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"V&T Nexis" <${process.env.BREVO_EMAIL.trim()}>`,
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        const info = await transporter.sendMail(mailOptions);

        console.log('Email gửi thành công:', info.response);

        return info;

    } catch (error) {
        console.error('LỖI GỬI MAIL:', error);
        throw error;
    }
};

module.exports = sendEmail;