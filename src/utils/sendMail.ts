import nodemailer, { Transporter } from "nodemailer";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // Get current file path
const __dirname = path.dirname(__filename); // Get current directory path

interface EmailOptions {
  email: string;
  subject: string;
  templateName: string;
  data: { [key: string]: any };
}

export const sendMail = async (options: EmailOptions) => {
  try {
    const transporter: Transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      service: process.env.SMTP_SERVICE,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const html = await ejs.renderFile(path.join(__dirname,"../../public/mails/",options.templateName),options.data)

    await transporter.sendMail({
        from:process.env.SMTP_MAIL,
        to:options?.email,
        subject:options?.subject,
        html: html
    })

  } catch (error) {
    console.log(error);
  }
};
