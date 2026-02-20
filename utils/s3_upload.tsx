import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Interfaces
interface S3UploadParams {
  bucket: string;
  key: string;
  content: string;
}

// Clients
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "us-north-1",
  forcePathStyle: true, // for local testing with tools like LocalStack
});

// Functions
export const uploadToS3 = async (params: S3UploadParams): Promise<void> => {
  const { bucket, key, content } = params;
  console.log(`📤 Uploading to S3: bucket=${bucket}, key=${key}, region=${process.env.AWS_REGION}`);
  
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: content,
  });
  
  try {
    await s3Client.send(command);
    console.log(`✅ S3 upload successful`);
  } catch (error) {
    console.error(`❌ S3 upload failed:`, error);
    throw error;
  }
};