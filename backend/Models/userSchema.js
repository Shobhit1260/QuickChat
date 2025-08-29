const mongoose=require("mongoose");
const userSchema=new mongoose.Schema({
    nickname:{
        type:String,
    },
    email:{
        type:String,
    },
    groups:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:'group'
    }],
    picture:{
        type:String
    },
    chatHistory:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'message'
    },
    oauthProvider: {
      type: String,
    },
    oauthId: {
      type: String, 
      unique: true,
    },

})

module.exports = mongoose.model('User', userSchema);