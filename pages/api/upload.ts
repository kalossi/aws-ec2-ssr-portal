// pages/api/upload.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { uploadToS3, fetchS3Settings, updateS3Settings } from "../../utils/s3_utils";

type UploadResponse = {
  fileName?: string;
  maxFileSizeMb?: number;
  error?: string;
};

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse<UploadResponse>,
) => {
  if (req.method === "GET") {
    const maxFileSizeMb = await fetchS3Settings();
    return res.status(200).json({ maxFileSizeMb: maxFileSizeMb ?? 0 });
  }

  if (req.method === "PUT") {
    const { maxFileSizeMb } = req.body;

    if (typeof maxFileSizeMb !== "number") {
      return res.status(400).json({ error: "Invalid maxFileSizeMb" });
    }

    await updateS3Settings(maxFileSizeMb);
    return res.status(200).json({ maxFileSizeMb });
  }

  if (req.method === "POST") {
    const { fileName, fileContent } = req.body;

    if (!fileName || !fileContent) {
      return res.status(400).json({ error: "Missing fileName or fileContent" });
    }

    const maxFileSizeMb = await fetchS3Settings();
    const sizeMb =
      Buffer.byteLength(fileContent, "utf-8") / (1024 * 1024);

    if (maxFileSizeMb && sizeMb > maxFileSizeMb) {
      return res.status(400).json({
        error: `File too large: ${sizeMb.toFixed(2)}MB > ${maxFileSizeMb}MB`,
      });
    }

    const buffer = Buffer.from(fileContent, "base64");

    await uploadToS3({
      bucket: process.env.S3_BUCKET_NAME || "my-bucket",
      key: fileName,
      content: buffer,
    });

    return res.status(200).json({ fileName, maxFileSizeMb: sizeMb });
  }

  return res.status(405).json({ error: "Method not allowed" });
};

export default handler;
