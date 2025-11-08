import React, { useContext, useState } from "react";
import axios from "axios";
import useSkill from "../context/InterviewContext";

const ResumeUpload = () => {
  const [selectFile, setSelectFile] = useState(null);
  const [massage, setMassage] = useState("");
  const {setSkills} = useSkill()

  const handleFile = (e) => {
    setSelectFile(e.target.files[0]);
  };

  const formData = new FormData();
 formData.append("file", selectFile);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectFile) {
      alert("plese select file ");
      return
    }

    try {
      const backend_url = "http://localhost:5000"
      
      const res = await axios.post(`${backend_url}/api/resume/key`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setMassage("file uploaded");
      setSelectFile("")
      console.log("server respons", res.data.massage);
      console.log("server respons", res.data.success);
      console.log("server respons", res.data.data.data);
      setSkills(res.data.data.data)
    } catch (error) {
      if (error.response) {
        console.log("Server responded with :", error.response.data.massage);
        console.log("Server responded with :", error.response.data.success);
        console.log("Server responded with :", error.response);
      } else if (error.request) {
        console.log("No respons received: ", error.request);
      } else {
        console.log("Error setting up request:", error.massage);
      }
    }
  };
  return (
    <>
      <div className=" flex flex-col w-full h-screen bg-black">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFile}
          className="bg-white w-[15%] text-center m-3"
        />

        <button
          onClick={handleSubmit}
          className="bg-red-600 rounded w-[15%] m-3 "
        >
          Submit
        </button>
      </div>
      <div>{massage}</div>
    </>
  );
};

export default ResumeUpload;
