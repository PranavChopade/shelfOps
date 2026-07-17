import nodemailer from 'nodemailer';
import ENV from '../config/ENV.js';

let transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: ENV.SMTP_USER,
    pass: ENV.SMTP_PASS,
  },
});

export default transporter;

// template path reader
import fs from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
export function TemplateReader() {
  const __fileName = fileURLToPath(import.meta.url);
  const __dirname = dirname(__fileName);

  const templatePath = path.join(__dirname, './Template.html');

  let html = fs.readFileSync(templatePath, 'utf-8');
  return html;
}
