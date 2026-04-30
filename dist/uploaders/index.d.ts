export declare namespace ApolloServerFileUploads {
    type File = {
        filename: string;
        mimetype: string;
        encoding: string;
        createReadStream: Function;
    };
    type UploadedFileResponse = {
        filename: string;
        mimetype: string;
        encoding: string;
        url: string;
    };
    type UploadFileResponse = {
        url: string;
    };
    interface IUploader {
        singleFileUpload: ({ file, }: {
            file: File;
        }) => Promise<UploadedFileResponse>;
        multipleUploads: ({ files, }: {
            files: File[];
        }) => Promise<UploadedFileResponse[]>;
    }
}
