import { GraphQLError } from "graphql";
import { 
  ClubManagement, 
   CreateClubManagementInput, 
  UpdateClubManagementInput 
} from "../schema/club-management.schema";
import { ClubManagementModel } from "../models/club-management.model";
import { uploadToS3 } from "../utils/s3";
import Context from "../types/context";

export class ClubManagementService {
  async createClubManagement(input: CreateClubManagementInput, context: Context): Promise<ClubManagement> {
    try {
      const user = context.user!;

      // Handle file uploads (now includes videos)
      const uploadedFiles = await this.handleFileUploads(input, user._id);
      
      // Create club management with uploaded file URLs
      const clubManagement = await ClubManagementModel.create({
        ...input,
        ...uploadedFiles,
        gallery: {
          ...input.gallery,
          images: uploadedFiles.gallery?.images || input.gallery?.images || [],
          videos: uploadedFiles.gallery?.videos || input.gallery?.videos || []
        },
        createdBy: user._id
      });

      return clubManagement;
    } catch (error: any) {
      console.error("Error in createClubManagement:", error);
      throw new GraphQLError(`Failed to create club management: ${error.message}`);
    }
  }

  async getAllClubManagements(user: Context["user"]): Promise<ClubManagement[]> {
    try {
      // Fetch all club management data without role checks
      const clubs = await ClubManagementModel.find({}).lean();

      console.log("Found clubs:", {
        count: clubs.length,
        clubNames: clubs.map(club => club.clubName)
      });

      return clubs;
    } catch (error: any) {
      console.error("Error in getAllClubManagements:", error);
      throw new GraphQLError(`Failed to fetch club managements: ${error.message}`);
    }
  }

  async getAllClubDetails(user: Context["user"]): Promise<ClubManagement[]> {
    try {
      if (!user) {
        throw new GraphQLError("User not authenticated");
      }

      let clubs;
      // If user is admin, they can see all clubs
      if (user.role === "ADMIN") {
        clubs = await ClubManagementModel.find({}).lean();
      } else {
        // For regular users, only return their own club
        clubs = await ClubManagementModel.find({ createdBy: user._id }).lean();
      }

      return clubs;
    } catch (error) {
      throw new GraphQLError(`Failed to fetch club details: ${error.message}`);
    }
  }

  async findClubManagementById(clubId: string, user: Context["user"]): Promise<ClubManagement> {
    try {
      const clubManagement = await ClubManagementModel.findById(clubId);
      if (!clubManagement) {
        throw new GraphQLError("Club management not found");
      }
      return clubManagement;
    } catch (error) {
      throw new GraphQLError(`Failed to find club management: ${error.message}`);
    }
  }

  async updateClubManagement(
    input: UpdateClubManagementInput,
    clubId: string,
    user: Context["user"]
  ): Promise<ClubManagement> {
    try {
      if (!user) {
        throw new GraphQLError("User not authenticated");
      }

      // Handle file uploads (now includes videos)
      const uploadedFiles = await this.handleFileUploads(input, user._id);
      
      // First try to find by clubId (which is used as clubName)
      let clubManagement = await ClubManagementModel.findOne({ clubName: clubId });

      if (!clubManagement) {
        // If not found by clubName, try finding by _id as fallback
        clubManagement = await ClubManagementModel.findById(clubId);
      }

      if (!clubManagement) {
        // If no existing record is found, create a new one
        clubManagement = await ClubManagementModel.create({
          ...input,
          ...uploadedFiles,
          gallery: {
            ...input.gallery,
            images: uploadedFiles.gallery?.images || input.gallery?.images || [],
            videos: uploadedFiles.gallery?.videos || input.gallery?.videos || []
          },
          clubName: clubId,
          createdBy: user._id
        });
        return clubManagement;
      }

      // Prepare the update data
      const updateData = {
        ...input,
        ...uploadedFiles,
        gallery: {
          ...input.gallery,
          images: uploadedFiles.gallery?.images || input.gallery?.images || [],
          videos: uploadedFiles.gallery?.videos || input.gallery?.videos || []
        }
      };

      // If record exists, update it
      const updatedClubManagement = await ClubManagementModel.findByIdAndUpdate(
        clubManagement._id,
        updateData,
        { new: true }
      );

      if (!updatedClubManagement) {
        throw new GraphQLError("Failed to update club management");
      }

      return updatedClubManagement;
    } catch (error) {
      console.error("Error in updateClubManagement:", error);
      throw new GraphQLError(`Failed to update club management: ${error.message}`);
    }
  }

  async deleteClubManagement(clubId: string, user: Context["user"]): Promise<ClubManagement> {
    try {
      const deletedClubManagement = await ClubManagementModel.findByIdAndDelete(clubId);
      if (!deletedClubManagement) {
        throw new GraphQLError("Club management not found");
      }
      return deletedClubManagement;
    } catch (error) {
      throw new GraphQLError(`Failed to delete club management: ${error.message}`);
    }
  }

  private async handleFileUploads(input: any, userId: string) {
    const uploadedFiles: Record<string, any> = {};

    // Handle club logo
    if (input.clubLogo && typeof input.clubLogo === 'string' && input.clubLogo.startsWith('data:')) {
      console.log("Processing club logo upload");
      const buffer = Buffer.from(input.clubLogo.split(',')[1], 'base64');
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const key = `clubs/${userId}/logos/${uniqueId}.png`;
      console.log(`Uploading club logo with key: ${key}`);
      uploadedFiles.clubLogo = await uploadToS3({
        buffer,
        key,
        contentType: 'image/png'
      });
      console.log("Club logo uploaded successfully");
    }

    // Handle cover image
    if (input.coverImage && typeof input.coverImage === 'string' && input.coverImage.startsWith('data:')) {
      console.log("Processing cover image upload");
      const buffer = Buffer.from(input.coverImage.split(',')[1], 'base64');
      const uniqueId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      const key = `clubs/${userId}/covers/${uniqueId}.png`;
      console.log(`Uploading cover image with key: ${key}`);
      uploadedFiles.coverImage = await uploadToS3({
        buffer,
        key,
        contentType: 'image/png'
      });
      console.log("Cover image uploaded successfully");
    }

    // Handle statistics icons
    if (input.statistics) {
      console.log(`Processing statistics: ${input.statistics.length}`);
      const updatedStatistics = await Promise.all(
        input.statistics.map(async (stat: any, statIndex: number) => {
          console.log(`Processing statistic ${statIndex + 1}: ${stat.name || 'Unnamed statistic'}`);
          if (stat.icon && typeof stat.icon === 'string' && stat.icon.startsWith('data:')) {
            console.log(`Processing icon for statistic ${statIndex + 1}`);
            const buffer = Buffer.from(stat.icon.split(',')[1], 'base64');
            const uniqueId = `${Date.now()}-${statIndex}-${Math.random().toString(36).substring(2, 10)}`;
            const key = `clubs/${userId}/statistics/${uniqueId}.png`;
            console.log(`Uploading statistic icon with key: ${key}`);
            stat.icon = await uploadToS3({
              buffer,
              key,
              contentType: 'image/png'
            });
            console.log(`Uploaded statistic icon ${statIndex + 1} successfully`);
          }
          return stat;
        })
      );
      uploadedFiles.statistics = updatedStatistics;
    }

    // Handle who we are images
    if (input.whoWeAre) {
      console.log(`Processing whoWeAre sections: ${input.whoWeAre.length}`);
      console.log(`Full whoWeAre input: ${JSON.stringify(input.whoWeAre, null, 2)}`);
      
      const updatedWhoWeAre = await Promise.all(
        input.whoWeAre.map(async (section: any, sectionIndex: number) => {
          console.log(`Processing section ${sectionIndex + 1} with ${section.images?.length || 0} images, description: "${section.description?.substring(0, 30) || "[empty]"}..."`);
          
          // DEBUG - dump the exact structure of the section
          console.log(`Section ${sectionIndex + 1} structure: ${JSON.stringify({
            descriptionLength: section.description?.length || 0,
            hasImages: Boolean(section.images),
            imagesCount: section.images?.length || 0, 
            imageTypes: section.images?.map((img: any, i: number) => 
              `Image ${i+1}: ${typeof img === 'string' ? (img.startsWith('data:') ? 'base64' : 'url') : typeof img}`)
          }, null, 2)}`);
          
          if (section.images && Array.isArray(section.images)) {
            console.log(`Section has ${section.images.length} images before processing`);
            
            const processedImages = await Promise.all(
              section.images.map(async (image: string, imageIndex: number) => {
                console.log(`Looking at image ${imageIndex + 1}/${section.images.length}, type: ${typeof image}`);
                if (typeof image === 'string' && image.startsWith('data:')) {
                  console.log(`Processing Who We Are image ${imageIndex + 1}/${section.images.length}, starts with: ${image.substring(0, 30)}...`);
                  try {
                    const buffer = Buffer.from(image.split(',')[1], 'base64');
                    console.log(`Image ${imageIndex + 1} buffer created, size: ${buffer.length} bytes`);
                    
                    // Create a truly unique key using userId, timestamp, section index, image index and a random string
                    const uniqueId = `${Date.now()}-${sectionIndex}-${imageIndex}-${Math.random().toString(36).substring(2, 10)}`;
                    const key = `clubs/${userId}/who-we-are/${uniqueId}.png`;
                    console.log(`Uploading Who We Are image ${imageIndex + 1} with key: ${key}`);
                    
                    const url = await uploadToS3({
                      buffer,
                      key,
                      contentType: 'image/png'
                    });
                    
                    console.log(`Uploaded Who We Are image ${imageIndex + 1} successfully, URL: ${url.substring(0, 50)}...`);
                    return url;
                  } catch (err) {
                    console.error(`Error processing image ${imageIndex + 1}:`, err);
                    throw err;
                  }
                }
                console.log(`Using existing Who We Are image URL ${imageIndex + 1}: ${typeof image === 'string' ? image.substring(0, 30) + '...' : typeof image}`);
                return image;
              })
            );
            
            console.log(`After processing, section has ${processedImages.length} images`);
            section.images = processedImages;
          } else {
            console.warn(`Section ${sectionIndex + 1} has no images array or it's not an array: ${JSON.stringify(section.images)}`);
            section.images = section.images || [];
          }
          
          console.log(`Finished processing section ${sectionIndex + 1}, final image count: ${section.images.length}`);
          return section;
        })
      );
      
      console.log(`Final whoWeAre sections after processing: ${updatedWhoWeAre.length}`);
      console.log(`Section details: ${updatedWhoWeAre.map((section, i) => 
        `Section ${i+1}: description length ${section.description?.length || 0}, images count: ${section.images?.length || 0}`).join(', ')}`);
        
      uploadedFiles.whoWeAre = updatedWhoWeAre;
    }

    // Handle services images
    if (input.services) {
      console.log(`Processing services: ${input.services.length}`);
      const updatedServices = await Promise.all(
        input.services.map(async (service: any, serviceIndex: number) => {
          console.log(`Processing service ${serviceIndex + 1}: ${service.name || 'Unnamed service'}`);
          if (service.image && typeof service.image === 'string' && service.image.startsWith('data:')) {
            console.log(`Processing service image for service ${serviceIndex + 1}`);
            const buffer = Buffer.from(service.image.split(',')[1], 'base64');
            // Create a truly unique key
            const uniqueId = `${Date.now()}-${serviceIndex}-${Math.random().toString(36).substring(2, 10)}`;
            const key = `clubs/${userId}/services/${uniqueId}.png`;
            console.log(`Uploading service image with key: ${key}`);
            service.image = await uploadToS3({
              buffer,
              key,
              contentType: 'image/png'
            });
            console.log(`Uploaded service image ${serviceIndex + 1} successfully`);
          }
          return service;
        })
      );
      uploadedFiles.services = updatedServices;
    }

    // Handle gallery images
    if (input.gallery?.images) {
      console.log(`Processing gallery images: ${input.gallery.images.length}`);
      const updatedGallery = { ...input.gallery };
      updatedGallery.images = await Promise.all(
        updatedGallery.images.map(async (image: string, imageIndex: number) => {
          if (typeof image === 'string' && image.startsWith('data:')) {
            console.log(`Processing gallery image ${imageIndex + 1}/${updatedGallery.images.length}`);
            const buffer = Buffer.from(image.split(',')[1], 'base64');
            // Create a truly unique key
            const uniqueId = `${Date.now()}-${imageIndex}-${Math.random().toString(36).substring(2, 10)}`;
            const key = `clubs/${userId}/gallery/images/${uniqueId}.png`;
            console.log(`Uploading gallery image with key: ${key}`);
            const url = await uploadToS3({
              buffer,
              key,
              contentType: 'image/png'
            });
            console.log(`Uploaded gallery image ${imageIndex + 1} successfully`);
            return url;
          }
          return image;
        })
      );
      uploadedFiles.gallery = { images: updatedGallery.images };
      if (input.gallery.videos) {
        uploadedFiles.gallery.videos = input.gallery.videos;
      }
    }

    // Handle gallery videos
    if (input.gallery?.videos) {
      console.log(`Processing gallery videos: ${input.gallery.videos.length}`);
      const updatedVideos = await Promise.all(
        input.gallery.videos.map(async (video: string, index: number) => {
          if (typeof video === 'string' && video.startsWith('data:')) {
            try {
              console.log(`Processing gallery video ${index + 1}/${input.gallery.videos.length}`);
              const contentType = video.split(';')[0].split(':')[1];
              const buffer = Buffer.from(video.split(',')[1], 'base64');
              const fileExtension = contentType.includes('mp4') ? 'mp4' : 
                                   contentType.includes('quicktime') ? 'mov' : 
                                   contentType.includes('webm') ? 'webm' : 'mp4';
              
              // Create a truly unique key
              const uniqueId = `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 10)}`;
              const key = `clubs/${userId}/gallery/videos/${uniqueId}.${fileExtension}`;
              console.log(`Uploading gallery video with key: ${key}`);
              
              const videoUrl = await uploadToS3({
                buffer,
                key,
                contentType
              });
              
              console.log(`Gallery video ${index + 1} uploaded successfully to S3`);
              return videoUrl;
            } catch (error) {
              console.error(`Error uploading gallery video ${index + 1}:`, error);
              throw new GraphQLError(`Failed to upload gallery video: ${error.message}`);
            }
          }
          return video; // Return as is if it's already a URL
        })
      );
      
      // Update the gallery object in uploadedFiles
      if (!uploadedFiles.gallery) {
        uploadedFiles.gallery = { videos: updatedVideos };
      } else {
        uploadedFiles.gallery.videos = updatedVideos;
      }
    }

    // Handle club form files
    if (input.forms && Array.isArray(input.forms)) {
      console.log(`Processing club form files: ${input.forms.length}`);
      const updatedForms = await Promise.all(
        input.forms.map(async (form: any, index: number) => {
          if (form.fileData && typeof form.fileData === 'string' && form.fileData.startsWith('data:')) {
            try {
              console.log(`Processing club form file ${index + 1}/${input.forms.length}: ${form.fileName}`);
              // Extract content type from the data URI
              const contentType = form.fileData.split(';')[0].split(':')[1] || form.fileType || 'application/octet-stream';
              const buffer = Buffer.from(form.fileData.split(',')[1], 'base64');
              
              // Determine file extension from the filename or content type
              let fileExtension = '';
              if (form.fileName && form.fileName.includes('.')) {
                fileExtension = form.fileName.split('.').pop();
              } else {
                fileExtension = contentType.includes('pdf') ? 'pdf' : 
                                contentType.includes('word') ? 'docx' : 
                                contentType.includes('excel') ? 'xlsx' : 'pdf';
              }
              
              // Create a unique key preserving the original filename
              const sanitizedFileName = form.fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
              const uniqueId = `${Date.now()}-${index}-${Math.random().toString(36).substring(2, 10)}`;
              const key = `clubs/${userId}/forms/${uniqueId}-${sanitizedFileName}`;
              console.log(`Uploading club form file with key: ${key}`);
              
              const fileUrl = await uploadToS3({
                buffer,
                key,
                contentType
              });
              
              console.log(`Club form file ${index + 1} uploaded successfully to S3`);
              
              // Return the form data with the file URL instead of base64 data
              return {
                fileName: form.fileName,
                fileType: form.fileType,
                fileSize: form.fileSize,
                fileData: fileUrl
              };
            } catch (error) {
              console.error(`Error uploading club form file ${index + 1}:`, error);
              throw new GraphQLError(`Failed to upload club form file: ${error.message}`);
            }
          }
          return form; // Return as is if fileData is not a base64 string
        })
      );
      
      uploadedFiles.forms = updatedForms;
    }

    return uploadedFiles;
  }
} 