import { EntryModel } from '../models/Entry';
import * as mail from 'nodemailer';
import * as heml from 'heml';
import * as Handlebars from 'handlebars';
import * as templates from '../templates';
import { SignRequestOptions } from '../templates/SignRequest';
import User from '../models/User';

let mailConfig;
if (process.env.NODE_ENV === 'production') {
  mailConfig = {
    host: 'smtp.sendgrid.net',
    port: 587,
    auth: {
      user: 'real.user',
      pass: 'verysecret',
    },
  };
} else {
  mailConfig = {
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'louf4yh5lnkyg2h3@ethereal.email',
      pass: 'mWgCFb9JcJxdeKa6RE',
    },
  };
}
const transporter = mail.createTransport(mailConfig);

/**
 * ## Handlebars Templates
 */
const signRequest: HandlebarsTemplateDelegate<SignRequestOptions>
  = Handlebars.compile(templates.signRequest);

export const dispatchSignRequest = async (entry: EntryModel) => {
  try {
    const hemlTemplate = await signRequest({
      preview: 'Sign the Request!',
      link_address: 'https://simonknott.de',
      link_display: 'test',
      subject: 'You are requested to sign the Entry.',
    });
    const { html, metadata, errors } = await heml(hemlTemplate);

    const parents = await User.find({ children: entry.student }).select('email');
    
    const recipients = parents.map(parent => parent.email);
  
    transporter.sendMail({
      html,
      to: recipients,
      subject: metadata.subject,
    });
  } catch (error) {
    throw error;
  }
};
