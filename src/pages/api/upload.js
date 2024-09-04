import multer from 'multer';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';
import archiver from 'archiver';
export const runtime = "experimental-edge"

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


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      await new Promise((resolve, reject) => {
        upload.array('images')(req, res, (err) => {
          if (err) {
            reject(err);
          } else {
            resolve(undefined);
          }
        });
      });

      const { b_id, secret_code, location, timestamp } = req.body;

      if (secret_code !== process.env.SECRET_CODE) {
        return res.status(401).json({ message: 'Invalid secret code' });
      }

      const locationObj = JSON.parse(location);
      const zipFileName = `${b_id}_${locationObj.latitude}_${locationObj.longitude}_${timestamp}.zip`;
      const zipFilePath = path.join(process.cwd(), 'public', zipFileName);
      const output = fs.createWriteStream(zipFilePath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', async () => {
        try {
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

          await transporter.sendMail(mailOptions);
          console.log('Email sent successfully');
          res.status(200).json({ message: 'Images uploaded and email sent successfully!' });
        } catch (error) {
          console.error('Error sending email:', error);
          res.status(500).json({ message: 'Error sending email', error: error.message });
        } finally {
          // Clean up the zip file
          fs.unlink(zipFilePath, (err) => {
            if (err) console.error('Error deleting zip file:', err);
          });
        }
      });

      archive.on('error', (err) => {
        console.error('Error creating archive:', err);
        res.status(500).json({ message: 'Error creating archive', error: err.message });
      });

      req.files?.forEach((file) => {
        archive.append(file.buffer, { name: file.originalname });
      });

      archive.pipe(output);
      archive.finalize();
    } catch (error) {
      console.error('Error handling upload:', error);
      res.status(500).json({ message: 'Error handling upload', error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}