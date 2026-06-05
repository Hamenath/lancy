import { useState } from "react";
import { uploadImage } from "./utils/uploadImage";

export default function TestUpload() {
  const [file, setFile] = useState<any>(null);

  const handleUpload = async () => {
    const url = await uploadImage(file);
    console.log(url);
    alert(url);
  };

  return (
    <div style={{ padding: "20px", border: "1px solid #333", margin: "20px", borderRadius: "8px" }}>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />
      <button onClick={handleUpload} style={{ marginLeft: "10px", padding: "5px 10px", background: "#3b82f6", color: "white", borderRadius: "4px" }}>
        Upload
      </button>
    </div>
  );
}
