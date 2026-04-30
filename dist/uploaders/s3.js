"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AWSS3Uploader = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const fs_1 = __importDefault(require("fs"));
class AWSS3Uploader {
    constructor() {
        this.config = {
            region: process.env.S3_BUCKET_REGION,
            accessKeyId: process.env.S3_ACCESS_KEY,
            secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            destinationBucketName: process.env.S3_DESTINATION_BUCKET,
        };
        this.s3 = new client_s3_1.S3Client({
            region: this.config.region,
            credentials: {
                accessKeyId: this.config.accessKeyId,
                secretAccessKey: this.config.secretAccessKey,
            },
        });
    }
    async createUploadStream(Key, fileStream) {
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.config.destinationBucketName,
            Key,
            Body: fileStream,
        });
        const promise = this.s3.send(command);
        return { promise };
    }
    createDestinationFilePath(filename) {
        const queHoraEs = Date.now();
        const regex = /[\s_-]/gi;
        const fileTemp = filename.replace(regex, ".");
        let arrTemp = [fileTemp.split(".")];
        return `${arrTemp[0].slice(0, arrTemp[0].length - 1).join("_")}${queHoraEs}.${arrTemp[0].pop()}`;
    }
    async singleFileUpload({ file, }) {
        const { createReadStream, filename, mimetype, encoding } = file;
        const fileStream = createReadStream();
        const filePath = this.createDestinationFilePath(filename);
        const uploadStream = await this.createUploadStream(filePath, fileStream);
        const result = await uploadStream.promise;
        return { filename, mimetype, encoding, url: result.Location };
    }
    async uploadFile(path) {
        const fileStream = fs_1.default.createReadStream(path);
        const filePath = this.createDestinationFilePath(path);
        const uploadStream = await this.createUploadStream(filePath, fileStream);
        const result = await uploadStream.promise;
        return { url: result.Location };
    }
    async multipleUploads({ files, }) {
        return Promise.all(files.map((f) => this.singleFileUpload({ file: f })));
    }
    async uploadFileToS3(localFilePath, s3Key) {
        const fileStream = fs_1.default.createReadStream(localFilePath);
        const command = new client_s3_1.PutObjectCommand({
            Bucket: this.config.destinationBucketName,
            Key: s3Key,
            Body: fileStream,
        });
        try {
            await this.s3.send(command);
            return `https://${this.config.destinationBucketName}.s3.amazonaws.com/${s3Key}`;
        }
        catch (error) {
            console.error("Error uploading file to S3:", error);
            throw error;
        }
    }
}
exports.AWSS3Uploader = AWSS3Uploader;
//# sourceMappingURL=s3.js.map