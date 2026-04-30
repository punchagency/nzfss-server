import { logger } from "./logger";
import S3Handler from "./s3Handler";
import dotenv from 'dotenv';
import { ApolloError } from "apollo-server";

dotenv.config(); // Load environment variables

// Helper function to clean and validate base64 stringss
const cleanAndValidateBase64 = (base64String: string): { valid: boolean; cleaned: string; error?: string } => {
  try {
    // Log the input for debugging
    logger.info(`Cleaning base64 string. Original length: ${base64String.length}`);
    logger.info(`First 10 chars: "${base64String.substring(0, 10)}"`);
    logger.info(`First 50 chars: "${base64String.substring(0, 50)}"`);
    
    // Check if it's empty
    if (!base64String || base64String.length === 0) {
      logger.error("Base64 string is empty");
      return { 
        valid: false, 
        cleaned: base64String, 
        error: "Base64 string is empty" 
      };
    }
    
    // Check if it's already a properly formatted data URI without cleaning first
    if (base64String.startsWith("data:")) {
      logger.info("Base64 string already starts with 'data:' prefix");
      
      // Still clean it to remove any potential whitespace
      let cleaned = base64String.replace(/[\r\n\t\s]/g, "");
      return { valid: true, cleaned };
    }
    
    // Check for common format problems
    if (base64String.includes("data:") && !base64String.startsWith("data:")) {
      logger.warn("Base64 string contains 'data:' but doesn't start with it. First occurrence at position: " + base64String.indexOf("data:"));
      
      // Try to extract the data URI part
      const dataStart = base64String.indexOf("data:");
      if (dataStart > -1) {
        logger.info(`Extracting data URI starting from position ${dataStart}`);
        const extracted = base64String.substring(dataStart);
        logger.info(`Extracted prefix: "${extracted.substring(0, 50)}"`);
        
        // Clean the extracted part
        const cleaned = extracted.replace(/[\r\n\t\s]/g, "");
        
        // Validate the extracted part
        if (cleaned.split(",").length === 2) {
          logger.info("Successfully extracted and cleaned the data URI");
          return { valid: true, cleaned };
        }
      }
    }
    
    // Remove any whitespace, line breaks, etc.
    let cleaned = base64String.replace(/[\r\n\t\s]/g, "");
    logger.info(`Cleaned length: ${cleaned.length}`);
    logger.info(`Cleaned first 10 chars: "${cleaned.substring(0, 10)}"`);
    
    // Check if it's a properly formatted data URI
    if (!cleaned.startsWith("data:")) {
      logger.error(`String does not start with 'data:' prefix. Starting with: "${cleaned.substring(0, 10)}"`);
      
      // Check if it might be a raw base64 string
      if (/^[A-Za-z0-9+/=]+$/.test(cleaned)) {
        logger.info("String appears to be a raw base64 string, adding PDF prefix");
        cleaned = `data:application/pdf;base64,${cleaned}`;
        return { valid: true, cleaned };
      }
      
      return { 
        valid: false, 
        cleaned, 
        error: "String does not start with 'data:' prefix" 
      };
    }
    
    // Split the string into metadata and content
    const parts = cleaned.split(",");
    if (parts.length !== 2) {
      return { 
        valid: false, 
        cleaned, 
        error: `Invalid data URI format. Parts: ${parts.length}` 
      };
    }
    
    const [metaPart, dataPart] = parts;
    
    // Validate metadata part
    if (!metaPart.includes("base64")) {
      return { 
        valid: false, 
        cleaned, 
        error: "Missing 'base64' encoding type in metadata" 
      };
    }
    
    // Check if content type is present
    const contentType = metaPart.split(";")[0].split(":")[1];
    if (!contentType) {
      return { 
        valid: false, 
        cleaned, 
        error: "Missing content type in metadata" 
      };
    }
    
    // Validate base64 content
    if (!dataPart || dataPart.length < 100) {
      return { 
        valid: false, 
        cleaned, 
        error: `Base64 data too short or missing. Length: ${dataPart ? dataPart.length : 0}` 
      };
    }
    
    // Check for invalid characters in base64 content
    if (!/^[A-Za-z0-9+/=]+$/.test(dataPart)) {
      logger.warn("Base64 data contains invalid characters, attempting to clean");
      
      // Try to clean the data part
      const cleanedData = dataPart.replace(/[^A-Za-z0-9+/=]/g, "");
      if (cleanedData.length < 100) {
        return { 
          valid: false, 
          cleaned, 
          error: "Base64 data contains too many invalid characters" 
        };
      }
      
      // Reconstruct the string with cleaned data
      cleaned = `${metaPart},${cleanedData}`;
      logger.info("Successfully cleaned base64 data");
    }
    
    return { valid: true, cleaned };
  } catch (error) {
    logger.error(`Error in cleanAndValidateBase64: ${error}`);
    return { 
      valid: false, 
      cleaned: base64String, 
      error: `Exception during validation: ${error instanceof Error ? error.message : "Unknown error"}` 
    };
  }
};

const uploadFile = async (
  base64FileData: string,
  uniqueId: string,
  keyPrefix: string
): Promise<string> => {
  try {
    // Log the input for debugging
    logger.info(`Uploading file. Input length: ${base64FileData.length}`);
    logger.info(`Input prefix: ${base64FileData.substring(0, 50)}`);

    // Clean and validate the base64 string
    const { valid, cleaned, error } = cleanAndValidateBase64(base64FileData);
    
    if (!valid) {
      logger.error(`Invalid base64 string: ${error}`);
      logger.error(`Original length: ${base64FileData.length}`);
      logger.error(`Cleaned length: ${cleaned.length}`);
      logger.error(`Cleaned prefix: ${cleaned.substring(0, 50)}`);
      throw new ApolloError(`Invalid file format: ${error}`);
    }
    
    // Parse the content type from the data URI
    const [metaPart, dataPart] = cleaned.split(",");
    let contentType = "application/pdf"; // Default to PDF
    
    try {
      contentType = metaPart.split(";")[0].split(":")[1];
    } catch (error) {
      logger.warn(`Could not parse content type from metadata: ${metaPart}`);
      logger.warn("Using default content type: application/pdf");
    }
    
    // Extract file format from content type
    const fileFormat = contentType.split("/")[1] || "pdf"; // Default to pdf if extraction fails
    
    // Create a unique filename
    const timestamp = Date.now();
    const uniqueKey = `${keyPrefix}${uniqueId}_${timestamp}.${fileFormat}`;
    
    // Initialize the S3 handler
    const uploader = new S3Handler({
      bucket: process.env.S3_DESTINATION_BUCKET!,
      keyPrefix: keyPrefix,
    });
    
    // Prepare the file for upload
    const file = {
      key: uniqueKey,
      body: Buffer.from(dataPart, "base64"),
      contentType,
    };
    
    // Upload the file
    const uploadedUrl = await uploader.uploadFile(file);
    if (!uploadedUrl) {
      logger.error(`Failed to upload file: ${file.key}`);
      throw new ApolloError("Failed to upload file to storage. Please try again.");
    }
    
    logger.info(`File uploaded successfully. URL: ${uploadedUrl}`);
    return uploadedUrl;
  } catch (error) {
    logger.error(`Error uploading file: ${JSON.stringify(error, null, 2)}`);
    if (error instanceof ApolloError) {
      throw error; // Re-throw ApolloError as is
    }
    throw new ApolloError(`Failed to upload file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

export default uploadFile;
