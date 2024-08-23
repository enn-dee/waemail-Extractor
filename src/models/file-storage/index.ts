import { DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {logger} from "../../utils/logger";
import { Upload } from "@aws-sdk/lib-storage";

interface IStorageService {
  deleteFile: (key: string) => Promise<any>;
}

export default class StorageService implements IStorageService {
  public static instance: StorageService = new this();
  private s3Client: S3Client;

  private constructor() {
    this.s3Client = new S3Client({
      region: "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
      endpoint: process.env.AWS_S3_ENDPOINT as string,
    });
  }

  public deleteFile = async (key: string) => {
    const params = {
      Bucket: process.env.AWS_S3_BUCKET as string,
      Key: key,
    };
    try {
      const data = await this.s3Client.send(new DeleteObjectCommand(params));
      return data;
    } catch (err) {
      logger.log("Error", err);
    }
  };

  public uploadFile = async (file: any, fileName: string): Promise<string> => {
    const command = new Upload({
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
