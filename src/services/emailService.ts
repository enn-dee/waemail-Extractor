import Imap from "node-imap";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";

const imapuser: string = process.env.IMAP_USER || ("" as string);
const imappassword: string = process.env.IMAP_PASSWORD || ("" as string);

dotenv.config();

export const fetchEmails = async () => {
  const imap = new Imap({
    user: 'updates@connectmazjid.com',
    password: 'C0nn3ctM@zj!d',
    host: 'imap.titan.email',
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
            console.log(parsed.subject);
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
