import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

import { logger } from './logger'; 

interface S3Options {
  bucket: string;
  keyPrefix?: string;
}

interface UploadOptions {
  key: string;
  body: Buffer;
  contentType: string;
}

interface UpdateOptions {
  body: Buffer;
  contentType: string;
}

export default class S3Handler {
  private s3: S3Client;

  constructor(
    private readonly options: S3Options,
    private readonly awsConfig?: any
  ) {
    if (awsConfig) {
      this.s3 = new S3Client(awsConfig);
    } else {
      this.s3 = new S3Client({
        region: process.env.S3_BUCKET_REGION!, // Ensure the region is set
        credentials: {
          accessKeyId: process.env.S3_ACCESS_KEY!,
          secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
        },
      });
    }
  }

  async uploadFile(file: UploadOptions): Promise<string> {
    const { bucket, keyPrefix } = this.options;
    const { key, body, contentType } = file;
    const resolvedKey = keyPrefix ? keyPrefix + key : key;

    const params = {
      Bucket: bucket,
      Key: resolvedKey,
      Body: body,
      ContentType: contentType,
      ObjectOwnership: 'BucketOwnerEnforced'
    };

    try {
      // Using the v3 S3 client and PutObjectCommand
      await this.s3.send(new PutObjectCommand(params));
      return this.getFileUrl(resolvedKey);
    } catch (error) {
      logger.error(`S3 upload error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
      throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  // Delete file from S3
  async deleteFile(key: string): Promise<void> {
    const { bucket, keyPrefix } = this.options;
    const resolvedKey = keyPrefix ? keyPrefix + key : key;

    const params = {
      Bucket: bucket,
      Key: resolvedKey,
    };

    try {
      // Using the v3 S3 client and DeleteObjectCommand
      await this.s3.send(new DeleteObjectCommand(params));
    } catch (error) {
      throw new Error(`Failed to delete file from S3: ${error}`);
    }
  }

  // Update file in S3
  async updateFile(key: string, file: UpdateOptions): Promise<string> {
    const { bucket, keyPrefix } = this.options;
    const { body, contentType } = file;
    const resolvedKey = keyPrefix ? keyPrefix + key : key;

    const params = {
      Bucket: bucket,
      Key: resolvedKey,
      Body: body,
      ContentType: contentType,
      ObjectOwnership: 'BucketOwnerEnforced'
    };

    try {
      await this.s3.send(new PutObjectCommand(params));
      return this.getFileUrl(resolvedKey);
    } catch (error) {
      throw new Error(`Failed to update file in S3: ${error}`);
    }
  }

  // Generate URL to access the uploaded file
  public getFileUrl(key: string): string {
    const { bucket, keyPrefix } = this.options;
    const region = process.env.S3_BUCKET_REGION; // Ensure the region is set

  let resolvedKey = key;

  if (keyPrefix && !key.startsWith(keyPrefix)) {
    resolvedKey = keyPrefix + key;
  } 
    return `https://${bucket}.s3.${region}.amazonaws.com/${resolvedKey}`;
  }
}

