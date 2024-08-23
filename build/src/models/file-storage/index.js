"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const logger_1 = require("../../utils/logger");
const lib_storage_1 = require("@aws-sdk/lib-storage");
class StorageService {
    static instance = new this();
    s3Client;
    constructor() {
        this.s3Client = new client_s3_1.S3Client({
            region: "us-east-1",
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
            endpoint: process.env.AWS_S3_ENDPOINT,
        });
    }
    deleteFile = async (key) => {
        const params = {
            Bucket: process.env.AWS_S3_BUCKET,
            Key: key,
        };
        try {
            const data = await this.s3Client.send(new client_s3_1.DeleteObjectCommand(params));
            return data;
        }
        catch (err) {
            logger_1.logger.log("Error", err);
        }
    };
    uploadFile = async (file, fileName) => {
        const command = new lib_storage_1.Upload({
            client: this.s3Client,
            params: {
                Bucket: process.env.AWS_S3_BUCKET || "",
                Key: fileName,
                Body: file,
                ACL: "public-read",
            },
        });
        await command.done();
        return fileName;
    };
}
exports.default = StorageService;
