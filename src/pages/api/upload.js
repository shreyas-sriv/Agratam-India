import multer from 'multer';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import archiver from 'archiver';

// Setup multer for handling file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Ensure API route does not parse JSON body
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to run multer
const runMiddleware = (req, res, fn) => {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
};

export default async function handler(req, res) {
  // if (req.method === 'POST') {
    try {
      await runMiddleware(req, res, upload.array('images'));

      const { b_id, secret_code, location, timestamp } = req.body;

      if (secret_code !== process.env.SECRET_CODE) {
        return res.status(401).json({ message: 'Invalid secret code' });
      }

      const locationObj = JSON.parse(location);
      const zipFileName = `${b_id}_${locationObj.latitude}_${locationObj.longitude}_${timestamp}.zip`;
      const zipFilePath = path.join(process.cwd(), 'public', zipFileName);
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        const mailOptions = {
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_TO,
          subject: 'Image Upload with Location and Timestamp',
          text: `Attached are the images captured with B ID: ${b_id}, location: ${locationObj.latitude}, ${locationObj.longitude}, and timestamp: ${timestamp}`,
          attachments: [
            {
              filename: zipFileName,
              path: zipFilePath,
            },
          ],
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.error('Error sending email:', error);
            return res.status(500).json({ message: 'Error sending email' });
          }

          console.log('Email sent:', info.response);
          res.status(200).json({ message: 'Images uploaded and email sent successfully!' });

          fs.unlinkSync(zipFilePath); // Clean up the zip file
        });
      });

      archive.on('error', (err) => {
        throw err;
      });

      req.files.forEach((file) => {
        archive.append(file.buffer, { name: file.originalname });
      });

      archive.pipe(output);
      archive.finalize();
    } catch (error) {
      console.error('Error handling upload:', error);
      res.status(500).json({ message: 'Error handling upload' });
    // }
  } 
  // else {
  //   res.setHeader('Allow', ['POST']);
  //   res.status(405).end(`Method ${req.method} Not Allowed`);
  // }
}