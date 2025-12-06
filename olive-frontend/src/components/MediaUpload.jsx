import { useState } from "react";
import API from "../services/api";

export default function MediaUpload({ fieldId, onMedia }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [gps] = useState(null); // keep GPS optional for now

  const handlePick = (e) => {
    const picked = Array.from(e.target.files); // photos OR videos
    setFiles(picked);
  };

  const uploadAll = async () => {
    if (files.length === 0) return alert("Pick at least one file");
    setUploading(true);

    for (const file of files) {
      const form = new FormData();
      form.append("media", file); // 1 file per request (simple)
      form.append("fieldId", fieldId);
      form.append("gps", JSON.stringify(gps || {}));

      try {
        const { data } = await API.post("/upload/media", form, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        onMedia(data); // parent callback (url + meta)
      } catch (e) {
        console.error(e);
        alert(`Upload failed for ${file.name}`);
      }
    }
    setFiles([]);
    setUploading(false);
  };

  return (
    <div className="p-4 border rounded bg-white">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Choose Photos / Videos
      </label>
      <input
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handlePick}
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
      />

      {files.length > 0 && (
        <ul className="mt-2 text-sm text-gray-600">
          {files.map((f) => (
            <li key={f.name}>{f.name}</li>
          ))}
        </ul>
      )}

      <button
        onClick={uploadAll}
        disabled={uploading || files.length === 0}
        className="mt-3 w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50"
      >
        {uploading ? "⏫ Uploading…" : "⏫ Upload All"}
      </button>
    </div>
  );
}