// Quick test to verify SMTP credentials
const nodemailer = require('nodemailer');
require('dotenv').config();

async function testSMTP() {
    console.log('SMTP_EMAIL:', process.env.SMTP_EMAIL);
    console.log('SMTP_PASSWORD length:', process.env.SMTP_PASSWORD?.length, 'chars');
    console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD?.replace(/./g, '*'));

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD,
        },
    });

    try {
        console.log('\nVerifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful! Credentials are valid.');

        // Try sending a test email
        console.log('\nSending test email...');
        const info = await transporter.sendMail({
            from: `"TuniShield" <${process.env.SMTP_EMAIL}>`,
            to: process.env.SMTP_EMAIL, // Send to self
            subject: 'TuniShield SMTP Test',
            text: 'If you see this, SMTP is working!',
        });
        console.log('✅ Test email sent! Message ID:', info.messageId);
    } catch (error) {
        console.error('❌ SMTP failed:', error.message);
        console.error('\nTo fix this:');
        console.error('1. Make sure 2-Step Verification is ON for', process.env.SMTP_EMAIL);
        console.error('2. Go to: https://myaccount.google.com/apppasswords');
        console.error('3. Generate a NEW App Password for "TuniShield"');
        console.error('4. Copy the 16-char password into .env as SMTP_PASSWORD');
    }
}

testSMTP();
