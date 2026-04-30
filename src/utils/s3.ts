import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { GraphQLError } from "graphql";

const s3Client = new S3Client({
  region: process.env.S3_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
});

interface S3UploadParams {
  buffer: Buffer;
  key: string;
  contentType: string;
}

export const uploadToS3 = async ({
  buffer,
  key,
  contentType,
}: S3UploadParams): Promise<string> => {
  try {
    const uploadParams = {
      Bucket: process.env.S3_DESTINATION_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      ObjectOwnership: 'BucketOwnerEnforced'
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    // Return the URL of the uploaded file
    return `https://${process.env.S3_DESTINATION_BUCKET}.s3.${process.env.S3_BUCKET_REGION}.amazonaws.com/${key}`;
  } catch (error) {
    console.error('S3 upload error:', error);
    throw new GraphQLError(`Failed to upload file to S3: ${error.message}`);
  }
};

// Helper function to upload base64 files
export const uploadFile = async (
  base64String: string,
  userId: string,
  path: string,
  entityId?: string // Add optional entityId parameter
): Promise<string> => {
  try {
    const buffer = Buffer.from(base64String.split(',')[1], 'base64');
    // Include both entityId and timestamp in the key to ensure uniqueness
    const timestamp = Date.now();
    const uniqueKey = entityId ? `${entityId}_${timestamp}` : timestamp.toString();
    const key = `${path}${userId}/${uniqueKey}`;
    const contentType = base64String.split(';')[0].split(':')[1];

    return await uploadToS3({
      buffer,
      key,
      contentType
    });
  } catch (error) {
    console.error('File upload error:', error);
    throw new GraphQLError(`Failed to upload file: ${error.message}`);
  }
}; 