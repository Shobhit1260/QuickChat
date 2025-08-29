const mongoose=require('mongoose');
const groupSchema=new mongoose.Schema({
    nickname:{
        type:String,
        required:true,
    },
    picture:{
       type: String,
       required: false,
       default:""
    },
    description:{
        type:String,
        required:false,
        default:""
    },
    createdBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
    },
    members:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }]  
})

module.exports = mongoose.model('group', groupSchema);