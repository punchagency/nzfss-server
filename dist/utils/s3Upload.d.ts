declare const uploadFile: (base64FileData: string, uniqueId: string, keyPrefix: string) => Promise<string>;
export default uploadFile;
