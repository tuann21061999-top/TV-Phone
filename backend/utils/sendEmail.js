const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // 1. Kiểm tra an toàn biến môi trường trước khi trim()
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error("Thiếu cấu hình EMAIL_USER hoặc EMAIL_PASS trong hệ thống!");
    }

    try {
        // 2. Cấu hình rõ ràng host và port thay vì chỉ ghi service: 'gmail'
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Dùng SSL cho port 465
            auth: {
                user: process.env.EMAIL_USER.trim(),
                pass: process.env.EMAIL_PASS.trim()
            }
        });

        // Tùy chọn gửi email
        const mailOptions = {
            from: `"V&T Nexis" <${process.env.EMAIL_USER.trim()}>`,
            to: options.to,
            subject: options.subject,
            html: options.html
        };

        // Gửi email
        const info = await transporter.sendMail(mailOptions);
        return info; 
        
    } catch (error) {
        // 3. THROW ERROR: Ném lỗi ra ngoài để authController biết đường báo lỗi 500
        console.error('LỖI GỬI MAIL NODEMAILER:', error);
        throw error; 
    }
};

module.exports = sendEmail;