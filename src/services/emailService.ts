import Imap from "node-imap";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";

dotenv.config();
const imapuser = process.env.IMAP_USER;
const imaphost = process.env.IMAP_HOST;
const imappass = process.env.IMAP_PASSWORD;

export const fetchEmails = async () => {
  const imap = new Imap({
    user: imapuser as string, 
    password: imappass as string, 
    host: imaphost, 
    port: parseInt(process.env.IMAP_PORT || "993"),
    tls: true,
    authTimeout: 30000,
    connTimeout: 30000,
    tlsOptions: { rejectUnauthorized: false },
    debug: console.log,
  });

  const openInbox = (cb: any) => {
    imap.openBox("INBOX", true, cb);
  };

  imap.once("ready", function () {
    openInbox(function (err: any, box: any) {
      if (err) throw err;
      const f = imap.seq.fetch("1:10", {
        bodies: "",
      });
      f.on("message", function (msg: any, seqno: any) {
        const prefix = "(#" + seqno + ") ";
        msg.on("body", function (stream: any, info: any) {
          simpleParser(stream, (err: any, parsed: any) => {
            if (err) {
              console.error("Error parsing email: ", err);
              return;
            }
            console.log(`${prefix}Subject: ${parsed.subject}`);
            console.log(`${prefix}Text: ${parsed.text}`);
            console.log(`${prefix}HTML: ${parsed.html}`);
          });
        });
      });
      f.once("end", function () {
        imap.end();
      });
    });
  });

  imap.once("error", function (err: any) {
    console.error("IMAP Error: ", err);
  });

  imap.connect();
};
