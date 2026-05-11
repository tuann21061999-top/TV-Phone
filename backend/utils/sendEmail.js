const axios = require('axios');

const sendEmail = async (options) => {
    // Kiểm tra biến môi trường
    if (!process.env.BREVO_EMAIL || !process.env.BREVO_API_KEY) {
        throw new Error('Thiếu BREVO_EMAIL hoặc BREVO_API_KEY');
    }

    try {
        // Gửi email qua Brevo REST API
        const response = await axios.post(
            'https://api.brevo.com/v3/smtp/email',
            {
                sender: {
                    name: 'V&T Nexis',
                    email: process.env.BREVO_EMAIL.trim()
                },

                to: [
                    {
                        email: options.to
                    }
                ],

                subject: options.subject,

                htmlContent: options.html
            },
            {
                headers: {
                    'api-key': process.env.BREVO_API_KEY.trim(),
                    'Content-Type': 'application/json'
                },

                timeout: 10000
            }
        );

        console.log('Email gửi thành công:', response.data);

        return response.data;

    } catch (error) {
        console.error(
            'LỖI GỬI MAIL:',
            error.response?.data || error.message
        );

        throw error;
    }
};

module.exports = sendEmail;