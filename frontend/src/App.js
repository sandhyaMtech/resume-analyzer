import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Upload a resume first!");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setLoading(true);

      const res = await axios.post(
        "https://resume-analyzer-8jal.onrender.com/analyze",
        formData
      );

      setResult(res.data.result);
    } catch (err) {
      console.error(err);
      alert("Backend error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>AI Resume Analyzer 🚀</h1>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={handleUpload}>
        {loading ? "Analyzing..." : "Analyze Resume"}
      </button>

      <pre style={{ marginTop: "20px", whiteSpace: "pre-wrap" }}>
        {result}
      </pre>
    </div>
  );
}

export default App;