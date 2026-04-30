"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const client_s3_1 = require("@aws-sdk/client-s3");
const logger_1 = require("./logger");
class S3Handler {
    constructor(options, awsConfig) {
        this.options = options;
        this.awsConfig = awsConfig;
        if (awsConfig) {
            this.s3 = new client_s3_1.S3Client(awsConfig);
        }
        else {
            this.s3 = new client_s3_1.S3Client({
                region: process.env.S3_BUCKET_REGION,
                credentials: {
                    accessKeyId: process.env.S3_ACCESS_KEY,
                    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
                },
            });
        }
    }
    async uploadFile(file) {
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
            await this.s3.send(new client_s3_1.PutObjectCommand(params));
            return this.getFileUrl(resolvedKey);
        }
        catch (error) {
            logger_1.logger.error(`S3 upload error: ${error instanceof Error ? error.message : JSON.stringify(error)}`);
            throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
    }
    async deleteFile(key) {
        const { bucket, keyPrefix } = this.options;
        const resolvedKey = keyPrefix ? keyPrefix + key : key;
        const params = {
            Bucket: bucket,
            Key: resolvedKey,
        };
        try {
            await this.s3.send(new client_s3_1.DeleteObjectCommand(params));
        }
        catch (error) {
            throw new Error(`Failed to delete file from S3: ${error}`);
        }
    }
    async updateFile(key, file) {
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
            await this.s3.send(new client_s3_1.PutObjectCommand(params));
            return this.getFileUrl(resolvedKey);
        }
        catch (error) {
            throw new Error(`Failed to update file in S3: ${error}`);
        }
    }
    getFileUrl(key) {
        const { bucket, keyPrefix } = this.options;
        const region = process.env.S3_BUCKET_REGION;
        let resolvedKey = key;
        if (keyPrefix && !key.startsWith(keyPrefix)) {
            resolvedKey = keyPrefix + key;
        }
        return `https://${bucket}.s3.${region}.amazonaws.com/${resolvedKey}`;
    }
}
exports.default = S3Handler;
//# sourceMappingURL=s3Handler.js.map