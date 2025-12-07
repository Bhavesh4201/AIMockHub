import mongoose  from "mongoose";

const feedbackSchema = new mongoose.Schema({
    user_id :{
        type : mongoose.Schema.Types.ObjectId ,
         ref : "User" ,
         required :true 
    }, 
    session_id:{
        type :mongoose.Schema.Types.ObjectId,
         ref : "InterviewSession" ,
         required : true 
    } ,
    question_id : {
         type :mongoose.Schema.Types.ObjectId,
         ref : "Question" ,
         required : true 
    } , 
    user_answer: {
        type: String,
        required: true
    },
    feedback_text: {
        type: String
    },
    strengths: {
        type: [String],
        default: []
    },
    improvements: {
        type: [String],
        default: []
    },
    score: {
        type: Number
    },
    emotion: {
        type : [String], 
        default : []
    } ,
    feedback_data: {
        type: Object  // Store the full feedback object as JSON
    }
}, {timestamps : true})

export  const Feedback = mongoose.model("feedback" , feedbackSchema)