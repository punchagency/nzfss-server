import { ApolloServerFileUploads } from "./index";
type S3UploadConfig = {
    accessKeyId: string;
    secretAccessKey: string;
    region?: string;
    destinationBucketName: string;
};
export declare class AWSS3Uploader implements ApolloServerFileUploads.IUploader {
    private s3;
    config: S3UploadConfig;
    constructor();
    private createUploadStream;
    private createDestinationFilePath;
    singleFileUpload({ file, }: {
        file: ApolloServerFileUploads.File;
    }): Promise<ApolloServerFileUploads.UploadedFileResponse>;
    uploadFile(path: string): Promise<ApolloServerFileUploads.UploadFileResponse>;
    multipleUploads({ files, }: {
        files: ApolloServerFileUploads.File[];
    }): Promise<ApolloServerFileUploads.UploadedFileResponse[]>;
    uploadFileToS3(localFilePath: string, s3Key: string): Promise<string>;
}
export {};
