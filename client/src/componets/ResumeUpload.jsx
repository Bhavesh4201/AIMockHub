import React, { useState } from 'react'

const ResumeUpload = () => {
    const [selectedFile , setSelectedFile]= useState()



    const handleChange =(e)=>{
        setSelectedFile(e.target.files[0])
        console.log(e.target.files[0])
    }
  return (
    <>

        <input type="file" name="file" id="" accept='.pdf' onChange={handleChange} className=' border font-bold cursor-pointer'/>
        
    </>
  )
}

export default ResumeUpload
