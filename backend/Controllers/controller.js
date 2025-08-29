const User=require('../Models/userSchema.js');
const Group=require('../Models/groupSchema');
const Message=require('../Models/messageSchema');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const fs = require('fs');
const dotenv = require("dotenv");
dotenv.config();
const {S3Client,PutObjectCommand, GetObjectCommand}=require('@aws-sdk/client-s3');
const { getSignedUrl } =require( "@aws-sdk/s3-request-presigner");
const pathtoUpload=path.join(__dirname,'./uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, pathtoUpload); 
  },
  filename: (req, file, cb) => {
    const cleanedOriginalName = file.originalname.trim();
    const uniqueName = `${uuidv4()}-${cleanedOriginalName}`;
    cb(null, uniqueName); 
  }
});
const upload = multer({ storage });

// @ts-ignore
const s3Client = new S3Client({ 
    region: process.env.AWS_REGION,
    credentials:{
        accessKeyId:process.env.AWS_ACCESS_KEY,
        secretAccessKey:process.env.AWS_SECRET_KEY,
    },
 });

exports.uploadMediatoS3=[upload.single("media"),
async (req, res) => {
try{
   const mediaFile= req.file;
  if (!mediaFile) {
        return res.status(400).json({ message: "Media file not found"});
    }
  const mediaS3Key = `media/${mediaFile.filename}`;  

  await s3Client.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: mediaS3Key,
      Body: fs.createReadStream(mediaFile.path),
      ContentType: mediaFile.mimetype,
    })
   )
    fs.unlinkSync(mediaFile.path);
  const publicUrl = `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.AWS_BUCKET_NAME}/${mediaS3Key}`;
   return res.status(200).json({
    message:"Media uploaded successfully to S3",
    s3Key:mediaS3Key,
    url:publicUrl
   })
   
   
}
catch(error){
  console.error("Error in multer upload:", error);
  return res.status(500).json({
    message:"Internal Server Error"
  });
}
}];

exports.fetchUser=async(req,res)=>{
   try{  
      const users= await User.find({});
      return res.status(200).json({
        success:true,
        users
      }) 
   }
   catch(error){
     console.log("error",error);
     res.status(500).json({
      message:"Internal Server Error"
     })
   }
}

exports.createGroup = async (req, res) => {
  try {
    const { nickname, membersId } = req.body;

    if (!nickname) {
      return res.status(400).json({
        success: false,
        message: "Please provide a group name.",
      });
    }

    if (membersId.length < 1) {
      return res.status(400).json({
        success: false,
        message: "Please add at least two members to the group.",
      });
    }
  

    const currentUser = await User.findOne({ oauthId: req.user.sub });
    console.log("currentUser:", currentUser);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: "Current user not found.",
      });
    }

    const group = await Group.create({
      nickname,
      members: [...membersId, currentUser], 
      createdBy: currentUser._id,
    });

    await User.updateMany(
      { _id: { $in: [...membersId, currentUser._id] } },
      { $push: { groups: group._id } }
    );

    res.status(201).json({
      success: true,
      group,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Internal server error.",
    });
  }
};


exports.addMember=async(req,res)=>{
  try{
    const {groupId,memberId}= req.body;
    if(!groupId){
        return res.status(400).json({
            success:false,
            message:"select the group."
        });
    }
    if(!memberId){
        return res.status(400).json({
            success:false,
            message:"provide the member."
        })
    }
    const flag = await Group.findOne({ members: memberId });
    if(flag){
      return res.status(400).json({
        message:"member is already present."
      })
    }
    await Group.updateOne(
        { _id: groupId },
        { $push: { members: memberId } }
    )
    await User.updateOne(
        { _id: memberId },
        { $push: { groups: groupId } }
    )
    
    res.status(200).json({ message: 'User added to group' });
  }
  catch(error){
    res.status(500).json({
      message:"internal server error."
    })

  }
}

exports.storeUser=async(req,res)=>{
  try{
    const {nickname,email,picture,sub}=req.body;
    let user = await User.findOne({ oauthId: sub });

  if (!user) {
    user = await User.create({
      email,
      nickname,
      picture,
      oauthId: sub,
      oauthProvider: "auth0",
    });
  }
    res.status(201).json({
      success:true,
      user
    })
  }
  catch(error){
    console.error("Error storing user:", error.message);
    res.status(500).json({
      message:"Internal Server Error."
    })
  }

}

exports.fetchchatHistory=async(req,res)=>{
  try{
    const {id1,id2}=req.params;
    const messages=await Message.find({
      $or:[
        { sender: id1, receiver: id2 },
        { sender: id2, receiver: id1 }
      ],
      receiverModel: "User"
    })
    .populate("sender").sort({ createdAt: 1 });
    res.status(200).json({
      success:true,
      messages
    });
  }
  catch(error){
    res.status(500).json({
      message:"Internal Server Error."
    })
  }
}

exports.fetchGroupChatHistory=async(req,res)=>{
  try{
    const{groupId}=req.params;
    const messages=await Message.find({
      receiver: groupId,
      receiverModel: "Group"
    }).
    populate('sender').
    sort({createdAt:1});
    res.status(200).json({
      success:true,
      messages
    })
  }
  catch(error){
    console.log("Error fetching group chat history:", error);
    res.status(500).json({
      success:false,
      message:"Internal Server Error"
    })
  }
}
exports.getallUsers=async(req,res)=>{
  try{
    const users=await User.find({});
    res.status(200).json({
      success:true,
      users
    });
  }
  catch(error){
    console.log("Error fetching all users:", error.message);
    res.status(500).json({
      message: "Internal Server Error."
    });
  }
}

exports.getallGroups=async(req,res)=>{
  try{
    const groups=await Group.find({});
    res.status(200).json({
      success:true,
      groups
    })
  }
  catch(error){
   console.log("Error fetching all groups:", error.message);
    res.status(500).json({
      message: "Internal Server Error."
    });
  }
}





