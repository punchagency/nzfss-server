"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = exports.uploadToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const graphql_1 = require("graphql");
const s3Client = new client_s3_1.S3Client({
    region: process.env.S3_BUCKET_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    },
});
const uploadToS3 = async ({ buffer, key, contentType, }) => {
    try {
        const uploadParams = {
            Bucket: process.env.S3_DESTINATION_BUCKET,
            Key: key,
            Body: buffer,
            ContentType: contentType,
            ObjectOwnership: 'BucketOwnerEnforced'
        };
        await s3Client.send(new client_s3_1.PutObjectCommand(uploadParams));
        return `https://${process.env.S3_DESTINATION_BUCKET}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${key}`;
    }
    catch (error) {
        console.error('S3 upload error:', error);
        throw new graphql_1.GraphQLError(`Failed to upload file to S3: ${error.message}`);
    }
};
exports.uploadToS3 = uploadToS3;
const uploadFile = async (base64String, userId, path, entityId) => {
    try {
        const buffer = Buffer.from(base64String.split(',')[1], 'base64');
        const timestamp = Date.now();
        const uniqueKey = entityId ? `${entityId}_${timestamp}` : timestamp.toString();
        const key = `${path}${userId}/${uniqueKey}`;
        const contentType = base64String.split(';')[0].split(':')[1];
        return await (0, exports.uploadToS3)({
            buffer,
            key,
            contentType
        });
    }
    catch (error) {
        console.error('File upload error:', error);
        throw new graphql_1.GraphQLError(`Failed to upload file: ${error.message}`);
    }
};
exports.uploadFile = uploadFile;
//# sourceMappingURL=s3.js.map