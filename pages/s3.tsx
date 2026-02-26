// pages/s3.tsx
import { useState, useEffect } from "react";
import styles from "../styles/s3.module.css";

const S3 = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [maxFileSizeMb, setMaxFileSizeMb] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<
    { fileName: string; size: number }[]
  >([]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/upload");
        const data = await res.json();
        setMaxFileSizeMb(data.maxFileSizeMb ?? null);
      } catch (err) {
        console.error("Failed to fetch max file size", err);
      }
    };
    fetchSettings();
  }, []);

  const handleFileUpload = async (file: File | null) => {
    if (!file) return setStatus("Please select a file first");

    setStatus("Uploading...");
    setIsLoading(true);

    try {
      const sizeMb = file.size / (1024 * 1024);

      if (maxFileSizeMb && sizeMb > maxFileSizeMb) {
        setStatus(
          `❌ File too large: ${sizeMb.toFixed(2)}MB > ${maxFileSizeMb}MB`,
        );
        return;
      }

      const fileContent = await file.text();

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: file.name,
          fileContent,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setUploadedFiles((prev) => [
        ...prev,
        { fileName: file.name, size: sizeMb },
      ]);
      setStatus(`✅ Uploaded ${file.name} (${sizeMb.toFixed(2)}MB)`);
    } catch (err: any) {
      setStatus(`❌ Upload failed: ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h1>S3 Storage Manager</h1>

      {/* File Picker */}
      <div>
        <input
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) setSelectedFile(file);
          }}
        />
        <button
          className={styles.uploadButton}
          onClick={() => handleFileUpload(selectedFile)}
          disabled={!selectedFile || isLoading}
        >
          {isLoading ? "Uploading..." : "Upload"}
        </button>
        {status && <p className={styles.statusText}>{status}</p>}
        <p>
          Max file size allowed:{" "}
          {maxFileSizeMb ? `${maxFileSizeMb} MB` : "Loading..."}
        </p>
      </div>

      {/* Uploaded files */}
      <ul>
        {uploadedFiles.map((f) => (
          <li key={f.fileName}>
            {f.fileName} — {f.size.toFixed(2)}MB
          </li>
        ))}
      </ul>
    </div>
  );
};

export default S3;
