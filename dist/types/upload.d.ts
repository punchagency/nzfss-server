import { Stream } from "stream";
export default interface Upload {
    filename: string;
    mimetype: string;
    encoding: string;
    createReadStream: () => Stream;
}
export interface VideoUpload {
    name: string;
    type: string;
    size: any;
    createReadStream: () => Stream;
}
