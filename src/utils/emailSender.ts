import nodemailer from 'nodemailer';

// Create transporter (replace with your SMTP config)
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // your SMTP host
    port: 587,                // 465 for SSL
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Function to send email
export const sendGeneratedCodeEmail = async (to: string, code: string): Promise<void> => {
    await transporter.sendMail({
        from: 'MyShop',
        to,
        subject: 'Your Verification Code',
        text: `Your generated code is: ${code}`,
        html: `<p>Your generated code is: <b>${code}</b></p>`
    });
};