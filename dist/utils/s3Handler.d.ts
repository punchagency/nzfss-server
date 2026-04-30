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
    private readonly options;
    private readonly awsConfig?;
    private s3;
    constructor(options: S3Options, awsConfig?: any);
    uploadFile(file: UploadOptions): Promise<string>;
    deleteFile(key: string): Promise<void>;
    updateFile(key: string, file: UpdateOptions): Promise<string>;
    getFileUrl(key: string): string;
}
export {};
