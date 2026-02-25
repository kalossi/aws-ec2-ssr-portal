// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { uploadToS3, fetchS3Settings } from "../../utils/s3_utils";

type UploadResponse = {
  fileName?: string;
  fileSizeMb?: number;
  error?: string;
};

const handler = async (req: NextApiRequest, res: NextApiResponse<UploadResponse>) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { fileName, fileContent } = req.body;

    if (!fileName || !fileContent) {
      return res.status(400).json({ error: "Missing fileName or fileContent" });
    }

    // fetch max file size from Postgres
    const maxFileSizeMb = await fetchS3Settings();
    const sizeMb = Buffer.byteLength(fileContent, "utf-8") / (1024 * 1024);

    if (maxFileSizeMb && sizeMb > maxFileSizeMb) {
      return res
        .status(400)
        .json({ error: `File too large: ${sizeMb.toFixed(2)}MB > ${maxFileSizeMb}MB` });
    }

    // upload to S3
    await uploadToS3({
      bucket: process.env.AWS_S3_BUCKET || "my-bucket",
      key: fileName,
      content: fileContent,
    });

    return res.status(200).json({ fileName, fileSizeMb: sizeMb });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return res.status(500).json({ error: err.message || "Unknown error" });
  }
};

export default handler;