import mongoose  from "mongoose";

const feedbackSchema = new mongoose.Schema({
    user_id :{
        type : mongoose.Schema.Types.ObjectId ,
         ref : "User" ,
         required :true 
    }, 
    test_session_id:{
        type :mongoose.Schema.Types.ObjectId,
         ref : "TestSession" ,
         required : true 
    } ,
    question_id : {
         type :mongoose.Schema.Types.ObjectId,
         ref : "Question" ,
         required : true 
    } ,
    emontion: {
        type : [String], default : []
    } , 
    feedback :{
        type : String
    },
}, {timestamps : true})

export  const feedback = mongoose.model("feedback" , feedbackSchema)