// .utils/s3_utils.tsx
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { pgPool } from "./server_utils";

// Interfaces
interface S3UploadParams {
  bucket: string;
  key: string;
  content: Buffer;
  sizeMb?: number;
}

// Clients
const s3Client = new S3Client({
  region: process.env.AWS_S3_REGION || "eu-north-1",
  forcePathStyle: true, // for local testing with tools like LocalStack
});

// Functions
export const uploadToS3 = async (params: S3UploadParams): Promise<void> => {
  const { bucket, key, content } = params;

  // console.log(`📤 Uploading to S3: bucket=${bucket}, key=${key}, region=${process.env.AWS_S3_REGION}`);

  const maxFileSizeMb = await fetchS3Settings();
  const contentSizeMb = content.length / (1024 * 1024);
  if (maxFileSizeMb !== null && contentSizeMb > maxFileSizeMb) {
    throw new Error(`File too large. Max allowed is ${maxFileSizeMb} MB`);
  }

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

export const fetchS3Settings = async (): Promise<number | null> => {
  try {
    const result = await pgPool.query(
      "SELECT max_file_size_mb FROM storage_config LIMIT 1",
    );
    if (!result.rows.length) return null;
    console.log(
      `Fetched max_file_size_mb from DB: ${result.rows[0].max_file_size_mb} (type: ${typeof result.rows[0].max_file_size_mb})`,
    );
    return Number(result.rows[0].max_file_size_mb);
  } catch (err) {
    console.error("Failed to fetch S3 settings:", err);
    return null;
  }
};

export const updateS3Settings = async (
  maxFileSizeMb: number,
): Promise<void> => {
  await pgPool.query(
    `
  INSERT INTO storage_config (id, max_file_size_mb, updated_at)
  VALUES (1, $1, NOW())
  ON CONFLICT (id)
  DO UPDATE SET
    max_file_size_mb = EXCLUDED.max_file_size_mb,
    updated_at = NOW()
  `,
    [maxFileSizeMb],
  );
};
