import Imap from "node-imap";
import { simpleParser } from "mailparser";
import dotenv from "dotenv";
import dayjs from "dayjs";
import { logger } from "../utils/logger";
import mazjidModel from "../models/mazjid.model";
import { findMazjid } from "./mazjidFromdb";

dotenv.config();

const imapuser = process.env.IMAP_USER;
const imaphost = process.env.IMAP_HOST;
const imappass = process.env.IMAP_PASSWORD;

export const fetchEmails = async () => {
  const imap = new Imap({
    user: imapuser as string,
    password: imappass as string,
    host: imaphost as string,
    port: parseInt(process.env.IMAP_PORT || "993"),
    tls: true,
    authTimeout: 30000,
    connTimeout: 30000,
    tlsOptions: { rejectUnauthorized: false },
    //debug: console.log,
  });

  const openInbox = (cb: any) => {
    imap.openBox("INBOX", true, cb);
  };

  imap.once("ready", function () {
    openInbox(function (err: any, box: any) {
      if (err) throw err;

      //will fetch mails of preivous 2 days
      // const DaysAgo = dayjs().subtract(2, "day").toDate();

      imap.search(
        ["ALL", ["SINCE", dayjs().subtract(2, "day").format("DD-MMM-YYYY")]],
        function (err: any, results: any) {
          if (err) {
            console.error("Search Error: ", err);
            return;
          }

          if (results.length === 0) {
            console.log("No emails found.");
            imap.end();
            return;
          }

          const f = imap.fetch(results, {
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

                const subjectLower = (parsed.subject || "").toLowerCase();

                
                console.log(`${prefix}From: ${parsed.from?.text}`);
                // console.log(`${prefix}HTML: ${parsed.html}`);
                //  console.log(`${prefix}Text: ${parsed.text}`);

                // console.log(`${prefix}Subject: ${parsed.subject}`);

                const fromName = parsed.from?.text.match(/(.*?)(?=\s*<)/)?.[1];
                const fromEmail = parsed.from?.text.match(/<(.*?)>/)?.[1];

                // console.log(`${prefix}From Name: ${fromName}`);
                // console.log(`${prefix}From Email: ${fromEmail}`);

                const SantizedName: string = fromName.replace(/"/g, "");

                //  findMazjid(cleanedString)
                findMazjid(SantizedName).then((data) => {
                  if (data) {
                    let url: string = data.externalLinks[1].url;
                    if (!url) {
                      logger.error(`No url found in db`);
                    } else {
                      console.log(
                        `URL found for Masjid - ${SantizedName}\tMasjid URL fetched: ${url}`
                      );
                    }
                  }
                });


              });
            });
          });

          f.once("end", function () {
            imap.end();
          });
        }
      );
    });
  });

  imap.once("error", function (err: any) {
    logger.error("IMAP error", err);
  });

  imap.connect();
};
