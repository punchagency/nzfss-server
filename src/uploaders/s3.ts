import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "fs";
import { Readable } from "stream";
import { ApolloServerFileUploads } from "./index";

type S3UploadConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  destinationBucketName: string;
};

type S3UploadStream = {
  promise: Promise<any>;
};

export class AWSS3Uploader implements ApolloServerFileUploads.IUploader {
  private s3: S3Client;
  public config: S3UploadConfig;

  constructor() {
    this.config = {
      region: process.env.S3_BUCKET_REGION as string,
      accessKeyId: process.env.S3_ACCESS_KEY as string,
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
      destinationBucketName: process.env.S3_DESTINATION_BUCKET as string,
    };

    this.s3 = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  private async createUploadStream(Key: string, fileStream: Readable): Promise<S3UploadStream> {
    const command = new PutObjectCommand({
      Bucket: this.config.destinationBucketName,
      Key,
      Body: fileStream,
    });
    const promise = this.s3.send(command);
    return { promise };
  }

  private createDestinationFilePath(filename: string): string {
    const queHoraEs = Date.now();
    const regex = /[\s_-]/gi;
    const fileTemp = filename.replace(regex, ".");
    let arrTemp = [fileTemp.split(".")];
    return `${arrTemp[0].slice(0, arrTemp[0].length - 1).join("_")}${queHoraEs}.${arrTemp[0].pop()}`;
  }

  async singleFileUpload({
    file,
  }: {
    file: ApolloServerFileUploads.File;
  }): Promise<ApolloServerFileUploads.UploadedFileResponse> {
    const { createReadStream, filename, mimetype, encoding } = file;

    const fileStream = createReadStream();

    const filePath = this.createDestinationFilePath(filename);

    const uploadStream = await this.createUploadStream(filePath, fileStream);

    const result = await uploadStream.promise;

    return { filename, mimetype, encoding, url: result.Location };
  }

  async uploadFile(
    path: string
  ): Promise<ApolloServerFileUploads.UploadFileResponse> {
    const fileStream = fs.createReadStream(path);

    const filePath = this.createDestinationFilePath(path);

    const uploadStream = await this.createUploadStream(filePath, fileStream);

    const result = await uploadStream.promise;

    return { url: result.Location };
  }

  async multipleUploads({
    files,
  }: {
    files: ApolloServerFileUploads.File[];
  }): Promise<ApolloServerFileUploads.UploadedFileResponse[]> {
    return Promise.all(files.map((f) => this.singleFileUpload({ file: f })));
  }

  async uploadFileToS3(localFilePath: string, s3Key: string): Promise<string> {
    const fileStream = fs.createReadStream(localFilePath);

    const command = new PutObjectCommand({
      Bucket: this.config.destinationBucketName,
      Key: s3Key,
      Body: fileStream,
    });

    try {
      await this.s3.send(command);
      // Return the URL of the uploaded file
      return `https://${this.config.destinationBucketName}.s3.amazonaws.com/${s3Key}`;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  }
}
