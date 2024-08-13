import express from "express";
import imaps from "imap-simple";
import { getEmails } from "./controllers/emailController";

const app = express();
const port = 3000;

// IMAP configuration
const config = {
  imap: {
    user: "updates@connectmazjid.com",
    password: "C0nn3ctM@zj!d",
    host: "imap.titan.email",
    port: 993,
    tls: true,
    authTimeout: 20000,
    connectionTimeout: 10000,
    tlsOptions: {
      rejectUnauthorized: false,
    },
  },
};

app.get("/fetch-emails", async (req, res) => {
  // try {
  //   const connection = await imaps.connect(config);
  //   await connection.openBox('INBOX');

  //   const searchCriteria = ['ALL'];
  //   const fetchOptions = { bodies: ['HEADER', 'TEXT'], markSeen: true };

  //   const messages = await connection.search(searchCriteria, fetchOptions);

  //   const emails = await Promise.all(
  //     messages.map(async (message) => {
  //       if (!message.parts) {
  //         return {
  //           subject: 'No subject',
  //           from: 'Unknown',
  //           date: 'Unknown',
  //           body: 'No body',
  //         };
  //       }

  //       try {
  //         const parts = await imaps.getParts(message);
  //         const headerPart = parts.find((part) => part.which === 'HEADER');
  //         const bodyPart = parts.find((part) => part.which === 'TEXT');

  //         console.log('Fetched message', message, " parts ", parts);
  //         return {

  //           subject: headerPart?.body.subject ? headerPart.body.subject[0] : 'No subject',
  //           from: headerPart?.body.from ? headerPart.body.from[0] : 'Unknown',
  //           date: headerPart?.body.date ? headerPart.body.date[0] : 'Unknown',
  //           body: bodyPart ? bodyPart.body : 'No body',
  //         };
  //       } catch (err) {
  //         console.error('Error processing message parts:', err);
  //         return {
  //           subject: 'Error',
  //           from: 'Unknown',
  //           date: 'Unknown',
  //           body: 'Error processing email',
  //         };
  //       }
  //     })
  //   );

  //   res.json(emails);

  //   connection.end();
  // } catch (error) {
  //   console.error('Error fetching emails:', error);
  //   res.status(500).send('Failed to fetch emails');
  // }
  getEmails(req, res);
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
