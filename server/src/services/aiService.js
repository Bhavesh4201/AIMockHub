import axios from "axios"

const AI_BASE_URL = "http://0.0.0.0:8000"

const aiService ={
    analyzResume: async (filePath)=>{
        const res = await axios.post(`${AI_BASE_URL}/api/analyze_resume` , {file_path : filePath});
       
        return res.data
    }
}


export default aiService 