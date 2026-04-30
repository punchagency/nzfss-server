"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = require("./logger");
const s3Handler_1 = __importDefault(require("./s3Handler"));
const dotenv_1 = __importDefault(require("dotenv"));
const apollo_server_1 = require("apollo-server");
dotenv_1.default.config();
const cleanAndValidateBase64 = (base64String) => {
    try {
        logger_1.logger.info(`Cleaning base64 string. Original length: ${base64String.length}`);
        logger_1.logger.info(`First 10 chars: "${base64String.substring(0, 10)}"`);
        logger_1.logger.info(`First 50 chars: "${base64String.substring(0, 50)}"`);
        if (!base64String || base64String.length === 0) {
            logger_1.logger.error("Base64 string is empty");
            return {
                valid: false,
                cleaned: base64String,
                error: "Base64 string is empty"
            };
        }
        if (base64String.startsWith("data:")) {
            logger_1.logger.info("Base64 string already starts with 'data:' prefix");
            let cleaned = base64String.replace(/[\r\n\t\s]/g, "");
            return { valid: true, cleaned };
        }
        if (base64String.includes("data:") && !base64String.startsWith("data:")) {
            logger_1.logger.warn("Base64 string contains 'data:' but doesn't start with it. First occurrence at position: " + base64String.indexOf("data:"));
            const dataStart = base64String.indexOf("data:");
            if (dataStart > -1) {
                logger_1.logger.info(`Extracting data URI starting from position ${dataStart}`);
                const extracted = base64String.substring(dataStart);
                logger_1.logger.info(`Extracted prefix: "${extracted.substring(0, 50)}"`);
                const cleaned = extracted.replace(/[\r\n\t\s]/g, "");
                if (cleaned.split(",").length === 2) {
                    logger_1.logger.info("Successfully extracted and cleaned the data URI");
                    return { valid: true, cleaned };
                }
            }
        }
        let cleaned = base64String.replace(/[\r\n\t\s]/g, "");
        logger_1.logger.info(`Cleaned length: ${cleaned.length}`);
        logger_1.logger.info(`Cleaned first 10 chars: "${cleaned.substring(0, 10)}"`);
        if (!cleaned.startsWith("data:")) {
            logger_1.logger.error(`String does not start with 'data:' prefix. Starting with: "${cleaned.substring(0, 10)}"`);
            if (/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
                logger_1.logger.info("String appears to be a raw base64 string, adding PDF prefix");
                cleaned = `data:application/pdf;base64,${cleaned}`;
                return { valid: true, cleaned };
            }
            return {
                valid: false,
                cleaned,
                error: "String does not start with 'data:' prefix"
            };
        }
        const parts = cleaned.split(",");
        if (parts.length !== 2) {
            return {
                valid: false,
                cleaned,
                error: `Invalid data URI format. Parts: ${parts.length}`
            };
        }
        const [metaPart, dataPart] = parts;
        if (!metaPart.includes("base64")) {
            return {
                valid: false,
                cleaned,
                error: "Missing 'base64' encoding type in metadata"
            };
        }
        const contentType = metaPart.split(";")[0].split(":")[1];
        if (!contentType) {
            return {
                valid: false,
                cleaned,
                error: "Missing content type in metadata"
            };
        }
        if (!dataPart || dataPart.length < 100) {
            return {
                valid: false,
                cleaned,
                error: `Base64 data too short or missing. Length: ${dataPart ? dataPart.length : 0}`
            };
        }
        if (!/^[A-Za-z0-9+/=]+$/.test(dataPart)) {
            logger_1.logger.warn("Base64 data contains invalid characters, attempting to clean");
            const cleanedData = dataPart.replace(/[^A-Za-z0-9+/=]/g, "");
            if (cleanedData.length < 100) {
                return {
                    valid: false,
                    cleaned,
                    error: "Base64 data contains too many invalid characters"
                };
            }
            cleaned = `${metaPart},${cleanedData}`;
            logger_1.logger.info("Successfully cleaned base64 data");
        }
        return { valid: true, cleaned };
    }
    catch (error) {
        logger_1.logger.error(`Error in cleanAndValidateBase64: ${error}`);
        return {
            valid: false,
            cleaned: base64String,
            error: `Exception during validation: ${error instanceof Error ? error.message : "Unknown error"}`
        };
    }
};
const uploadFile = async (base64FileData, uniqueId, keyPrefix) => {
    try {
        logger_1.logger.info(`Uploading file. Input length: ${base64FileData.length}`);
        logger_1.logger.info(`Input prefix: ${base64FileData.substring(0, 50)}`);
        const { valid, cleaned, error } = cleanAndValidateBase64(base64FileData);
        if (!valid) {
            logger_1.logger.error(`Invalid base64 string: ${error}`);
            logger_1.logger.error(`Original length: ${base64FileData.length}`);
            logger_1.logger.error(`Cleaned length: ${cleaned.length}`);
            logger_1.logger.error(`Cleaned prefix: ${cleaned.substring(0, 50)}`);
            throw new apollo_server_1.ApolloError(`Invalid file format: ${error}`);
        }
        const [metaPart, dataPart] = cleaned.split(",");
        let contentType = "application/pdf";
        try {
            contentType = metaPart.split(";")[0].split(":")[1];
        }
        catch (error) {
            logger_1.logger.warn(`Could not parse content type from metadata: ${metaPart}`);
            logger_1.logger.warn("Using default content type: application/pdf");
        }
        const fileFormat = contentType.split("/")[1] || "pdf";
        const timestamp = Date.now();
        const uniqueKey = `${keyPrefix}${uniqueId}_${timestamp}.${fileFormat}`;
        const uploader = new s3Handler_1.default({
            bucket: process.env.S3_DESTINATION_BUCKET,
            keyPrefix: keyPrefix,
        });
        const file = {
            key: uniqueKey,
            body: Buffer.from(dataPart, "base64"),
            contentType,
        };
        const uploadedUrl = await uploader.uploadFile(file);
        if (!uploadedUrl) {
            logger_1.logger.error(`Failed to upload file: ${file.key}`);
            throw new apollo_server_1.ApolloError("Failed to upload file to storage. Please try again.");
        }
        logger_1.logger.info(`File uploaded successfully. URL: ${uploadedUrl}`);
        return uploadedUrl;
    }
    catch (error) {
        logger_1.logger.error(`Error uploading file: ${JSON.stringify(error, null, 2)}`);
        if (error instanceof apollo_server_1.ApolloError) {
            throw error;
        }
        throw new apollo_server_1.ApolloError(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
};
exports.default = uploadFile;
//# sourceMappingURL=s3Upload.js.map