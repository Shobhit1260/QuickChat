const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  receiverModel: {
    type: String,
    required: true,
    enum: ["User", "Group"],
  },
  message: {
    type: String,
    default: "",
  },
  mediaKey:{
    type:String,
    default:""
  },
  mediaType:{
    type:String,
    default:"" 
  },
  isRead:{
    type:Boolean,
    default:false,
  }
}, {
  timestamps: true 
});

module.exports = mongoose.model('Message', messageSchema);

