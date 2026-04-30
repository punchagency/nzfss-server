interface S3UploadParams {
    buffer: Buffer;
    key: string;
    contentType: string;
}
export declare const uploadToS3: ({ buffer, key, contentType, }: S3UploadParams) => Promise<string>;
export declare const uploadFile: (base64String: string, userId: string, path: string, entityId?: string) => Promise<string>;
export {};
