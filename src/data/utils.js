import nodemailer from 'nodemailer';
import { MODULES } from './constants';
import { Channels, Notifications, Users } from '../db/models';

/**
 * Send email
 * @param {Array} args.toEmails
 * @param {String} args.fromEmail
 * @param {String} args.title
 * @param {String} args.templateArgs.name
 * @param {Object} args.templateArgs.data
 * @param {Boolean} args.isCustom
 * @return {Promise} null
*/

export const sendEmail = async ({ toEmails, fromEmail, title, templateArgs }) => {
  // TODO: test this method
  const { MAIL_SERVICE, MAIL_USER, MAIL_PASS, NODE_ENV } = process.env;
  const isTest = NODE_ENV == 'test';

  // do not send email it is running in test mode
  if (isTest) {
    return;
  }

  const transporter = nodemailer.createTransport({
    service: MAIL_SERVICE,
    auth: {
      user: MAIL_USER,
      pass: MAIL_PASS,
    },
  });

  const { data } = templateArgs;

  return toEmails.map(toEmail => {
    const mailOptions = {
      from: fromEmail,
      to: toEmail,
      subject: title,
      text: data,
    };

    return transporter.sendMail(mailOptions, (error, info) => {
      console.log(error); // eslint-disable-line
      console.log(info); // eslint-disable-line
    });
  });
};

/**
 * Send notification to all members of this channel except the sender
 * @param {String} channelId
 * @param {Array} memberIds
 * @param {String} userId
 * @return {Promise}
 */
export const sendChannelNotifications = async ({ channelId, memberIds, userId }) => {
  memberIds = memberIds || [];

  const channel = await Channels.findOne({ _id: channelId });

  const content = `You have invited to '${channel.name}' channel.`;

  return sendNotification({
    createdUser: userId,
    notifType: MODULES.CHANNEL_MEMBERS_CHANGE,
    title: content,
    content,
    link: `/inbox/${channel._id}`,

    // exclude current user
    receivers: memberIds.filter(id => id !== userId),
  });
};

/**
 * Send a notification
 * @param {String} doc.notifType
 * @param {String} doc.createdUser
 * @param {String} doc.title
 * @param {String} doc.content
 * @param {String} doc.link
 * @param {Array} doc.receivers Array of user ids
 * @return {Promise}
 */
export const sendNotification = async ({ createdUser, receivers, ...doc }) => {
  // collecting emails
  const recipients = await Users.find({ _id: { $in: receivers } });

  // collect recipient emails
  const toEmails = recipients.map(
    recipient => !(recipient.details && recipient.details.getNotificationByEmail === false),
  );

  // loop through receiver ids
  for (const receiverId of receivers) {
    doc.receiver = receiverId;

    try {
      // send notification
      await Notifications.createNotification(doc, createdUser);
    } catch (e) {
      // Any other error is serious
      if (e.message != 'Configuration does not exist') {
        throw e;
      }
    }
  }

  return sendEmail({
    toEmails,
    fromEmail: 'no-reply@erxes.io',
    title: 'Notification',
    template: {
      name: 'notification',
      data: {
        notification: doc,
      },
    },
  });
};

export default {
  sendEmail,
  sendNotification,
  sendChannelNotifications,
};
