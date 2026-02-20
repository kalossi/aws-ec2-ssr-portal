//pages/s3.tsx
import { useState, useEffect } from "react";
import styles from "../styles/s3.module.css";

const S3 = () => {
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    Array<{ fileName: string; size: number }>
  >([]);

  const uploadFile = async () => {
    setStatus("Uploading...");
    setIsLoading(true);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileName: "demo.txt",
          fileContent: "Hello from S3!",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setStatus(`Error: ${data.error}`);
        return;
      }

      setStatus(`Uploaded! Size: ${data.fileSizeMb}MB`);
      setUploadedFiles([
        ...uploadedFiles,
        {
          fileName: data.fileName || "demo.txt",
          size: parseFloat(data.fileSizeMb),
        },
      ]);
    } catch (error) {
      setStatus(
        `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsLoading(false);
    }
  };

  const [maxFileSizeMb, setMaxFileSizeMb] = useState<number | null>(null);

  useEffect(() => {
    const port = process.env.NEXT_PUBLIC_WS_PORT ?? '8085';
    const host = process.env.NEXT_PUBLIC_WS_HOST ?? 'localhost';
    const ws = new WebSocket(`ws://${host}:${port}`);

    ws.onmessage = (event) => {
  try {
    const parsed = JSON.parse(event.data);

    // If new format
    if (parsed?.maxFileSizeMb !== undefined) {
      setMaxFileSizeMb(parsed.maxFileSizeMb);
    }

  } catch (err) {
    console.error("WS parse error:", err);
  }
};
  }, []);

  return (
    <div>
      <div>
        <h1 className="text-4xl font-bold mb-12 text-center">
          S3 Storage Manager
        </h1>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Upload File</h2>
          <button
            className={styles.uploadButton}
            onClick={uploadFile}
            disabled={isLoading}
          >
            {isLoading ? "Uploading..." : "Upload demo.txt"}
          </button>
          {status && <p className={styles.statusText}>{status}</p>}
        </div>

        {/* Files List Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6">Uploaded Files</h2>
          {uploadedFiles.length === 0 ? (
            <p className="text-gray-500">No files uploaded yet</p>
          ) : (
            <ul className="space-y-3">
              {uploadedFiles.map((file, idx) => (
                <li
                  key={idx}
                  className="p-4 bg-gray-50 rounded border border-gray-200 flex justify-between items-center"
                >
                  <span className="font-medium">{file.fileName}</span>
                  <span className="text-gray-600">
                    {file.size.toFixed(2)}MB
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Storage Settings Section */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold mb-6">Storage Settings</h2>
          <p className="text-gray-500">
            Max file size allowed:{maxFileSizeMb !== null ? `${maxFileSizeMb} MB` : "Loading..."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default S3;
