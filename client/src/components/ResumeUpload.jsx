import React, { useState } from "react";
import { useAuth } from "../context/InterviewContext";
import { resumeAPI } from "../services/api.js";

const ResumeUpload = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setMessage("Please select a PDF file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setMessage("File size must be less than 5MB");
        return;
      }
      setSelectedFile(file);
      setMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedFile) {
      setMessage("Please select a file");
      return;
    }

    if (!user?.id) {
      setMessage("User not authenticated. Please login again.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const res = await resumeAPI.upload(user.id, selectedFile);
      
      if (res.data.success) {
        setMessage("Resume uploaded and analyzed successfully!");
        setSkills(res.data.data?.skills || res.data.skills);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = "";
      } else {
        setMessage(res.data.message || "Upload failed");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || "Failed to upload resume";
      setMessage(errorMessage);
      console.error("Upload error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload Resume</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="resume-file" className="block text-sm font-medium text-gray-700 mb-2">
            Select PDF Resume
          </label>
          <input
            id="resume-file"
            type="file"
            accept=".pdf"
            onChange={handleFile}
            disabled={loading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {selectedFile && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading || !selectedFile}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md transition-colors"
        >
          {loading ? "Uploading..." : "Upload & Analyze"}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-3 rounded-md ${
          message.includes("successfully") 
            ? "bg-green-50 text-green-800" 
            : "bg-red-50 text-red-800"
        }`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

      {skills && (
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold text-gray-800 mb-2">Extracted Skills:</h3>
          <div className="space-y-2">
            {skills.tech_skills && skills.tech_skills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700">Technical Skills:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {skills.tech_skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {skills.soft_skills && skills.soft_skills.length > 0 && (
              <div>
                <p className="text-sm font-medium text-gray-700">Soft Skills:</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {skills.soft_skills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeUpload;
