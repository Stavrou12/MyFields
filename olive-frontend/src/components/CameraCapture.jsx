import { useState, useCallback, useRef, useEffect } from "react";
import Webcam from "react-webcam";
import API from "../services/api";

const videoConstraints = { facingMode: "environment" };

export default function CameraCapture({ fieldId, onMedia }) {
  const webcamRef = useRef(null);
  const [img, setImg] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [gps, setGps] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (p) => setGps({ lat: p.coords.latitude, lng: p.coords.longitude }),
      () => setGps(null),
      { timeout: 5000 }
    );
  }, []);

  const capture = useCallback(() => {
    const src = webcamRef.current.getScreenshot();
    if (!src) return alert("Camera not ready");
    setImg(src);
  }, [webcamRef]);

  const upload = async () => {
    if (!img) return alert("No photo to upload");
    setUploading(true);
    try {
      // base64 → blob
      const blob = await (await fetch(img)).blob();
      const form = new FormData();
      form.append("photo", blob, "field.jpg");
      form.append("fieldId", fieldId);
      form.append("gps", JSON.stringify(gps || {}));

      const { data } = await API.post("/upload/photo", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onMedia(data); // parent callback
      setImg(null);
    } catch (e) {
      console.error(e);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-4 border rounded bg-white">
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
        className="rounded mb-2 w-full"
      />
      <div className="flex gap-2">
        <button
          onClick={capture}
          className="flex-1 bg-green-600 text-white py-2 rounded"
        >
          📸 Capture
        </button>
        <button
          onClick={upload}
          disabled={!img || uploading}
          className="flex-1 bg-blue-600 text-white py-2 rounded disabled:opacity-50"
        >
          {uploading ? "⏫ Uploading…" : "⏫ Upload"}
        </button>
      </div>
      {img && (
        <img src={img} alt="preview" className="mt-2 rounded max-h-40 mx-auto" />
      )}
      {gps && (
        <p className="text-xs text-gray-500 mt-1">
          📍 GPS: {gps.lat.toFixed(5)}, {gps.lng.toFixed(5)}
        </p>
      )}
    </div>
  );
}