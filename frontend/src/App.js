import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔥 Parse AI text → structured data
  const parseResult = (text) => {
    const sections = {
      score: "",
      skills: [],
      missing: [],
      suggestions: []
    };

    const lines = text.split("\n");
    let current = "";

    lines.forEach((line) => {
      if (line.includes("Score")) {
        sections.score = line;
      } else if (line.includes("Skills")) {
        current = "skills";
      } else if (line.includes("Missing Skills")) {
        current = "missing";
      } else if (line.includes("Suggestions")) {
        current = "suggestions";
      } else if (line.trim().startsWith("-")) {
        sections[current].push(line.replace("-", "").trim());
      }
    });

    return sections;
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a resume");
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
  setLoading(true);

  console.log("Calling API...");

  const res = await axios.post(
    "https://resume-analyzer-8jal.onrender.com/analyze",
    formData
  );

  console.log("RESPONSE 👉", res.data);

  if (res.data.error) {
    alert(res.data.error.message);
    return;
  }

  const parsed = parseResult(res.data.result);
  setResult(parsed);

} catch (err) {
  console.error("ERROR 👉", err);
  alert("Error connecting to backend");
} finally {
  setLoading(false);
}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-black flex items-center justify-center p-6">
      
      <div className="w-full max-w-3xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl p-8 text-white">
        
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-6">
          AI Resume Analyzer 🚀
        </h1>

        {/* Upload */}
        <div className="flex flex-col items-center gap-4">
          
          <label className="w-full border-2 border-dashed border-gray-400 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-400 transition">
            <input
              type="file"
              accept=".pdf"
              className="hidden"
              onChange={(e) => setFile(e.target.files[0])}
            />
            <p className="text-gray-300">
              {file ? file.name : "Click to upload your resume (PDF)"}
            </p>
          </label>

          <button
            onClick={handleUpload}
            className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-lg font-semibold transition duration-300 shadow-md"
          >
            {loading ? "Analyzing..." : "Analyze Resume"}
          </button>
        </div>

        {/* RESULT UI */}
        {result && (
          <div className="mt-8 space-y-6">

            {/* Score */}
            <div className="bg-indigo-500/20 p-4 rounded-xl text-center">
              <h2 className="text-xl font-semibold">🎯 {result.score}</h2>
            </div>

            {/* Skills */}
            {result.skills?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-green-400">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.skills.map((skill, i) => (
                    <span key={i} className="bg-green-500/20 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Skills */}
            {result.missing?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-red-400">Missing Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {result.missing.map((skill, i) => (
                    <span key={i} className="bg-red-500/20 px-3 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions */}
            {result.suggestions?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">Suggestions</h3>
                <ul className="list-disc pl-5 space-y-1 text-gray-300">
                  {result.suggestions.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}

export default App;