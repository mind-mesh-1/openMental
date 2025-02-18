// import { NextApiRequest, NextApiResponse } from 'next';
// import nodemailer from 'nodemailer';
//
// const sendSummary = async (req: NextApiRequest, res: NextApiResponse) => {
//   const { email, summary } = req.body;
//
//   if (!email || !summary) {
//     return res.status(400).json({ error: 'Email and summary are required' });
//   }
//
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
//
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'Notes Summary',
//     text: summary,
//   };
//
//   try {
//     await transporter.sendMail(mailOptions);
//     return res.status(200).json({ message: 'Email sent successfully' });
//   } catch (error) {
//     console.error('Error sending email:', error);
//     return res.status(500).json({ error: 'Failed to send email' });
//   }
// };
//
// export default sendSummary;
