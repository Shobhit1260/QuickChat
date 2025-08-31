const express= require("express");
const mongoose=require("mongoose");
const app=express();
const dotenv=require("dotenv");
const http = require("http");
const cors = require("cors");
const { Server } = require('socket.io');
const path = require("path");
const User = require("./Models/userSchema");
const Group= require('./Models/groupSchema');
const routes=require('./Routes/route')
const cookieParser=require('cookie-parser')
const Message=require("./Models/messageSchema");
const { Socket } = require("net");


dotenv.config();
const port=process.env.PORT||4000;


app.use(cors({
  origin: "https://quickchat-frontend-rs8b.onrender.com",
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());
app.use('/v1',routes);



const server =http.createServer(app);
const io = new Server(server,{
    cors: {
    origin: "https://quickchat-frontend-rs8b.onrender.com", 
    methods: ["GET", "POST"]
  }
});
console.log("process.env.FRONTEND_URL",process.env.FRONTEND_URL);
const onlineUsers = new Map();

io.on('connection',(socket)=>{
   const userId = socket.handshake.auth.userId;
   console.log(userId, "connected");
   if(!userId){
    socket.disconnect();
    return;
   }
   if(userId) {
    if(!onlineUsers.has(userId)){
      onlineUsers.set(userId,[]);
    }
    onlineUsers.get(userId).push(socket.id);
    console.log("onlineUsers",onlineUsers);
    io.emit('online-users', Array.from(onlineUsers.keys()));
  }

  socket.on('setup', async (userId) => { 
    //  for 1-1 chat
    socket.join(userId);
    // for group-chat 
    const user = await User.findById(userId).populate('groups');
    user?.groups.forEach(group => {
        socket.join(group._id.toString())
        console.log(group._id);
    })
    });


   socket.on("sendPrivateMessage",async({toUserId,message,fromUserId,mediaKey})=>{
    try{
       const savedMessage=await Message.create({
        sender:fromUserId,
        receiver:toUserId,
        receiverModel:"User",
        message,
        mediaKey,
        isRead:false, 
       })
      const sockets=onlineUsers.get(toUserId);
      console.log("sockets",sockets);
      sockets?.forEach((sockt)=>{
        io.to(sockt).emit("receivedPrivateMessage",savedMessage);
      }) 
      

      }
      catch(error){
       console.log("error",error);
      }
    })
   socket.on("sendGroupMessage",async({toGroupId,message,fromUserId,mediaKey})=>{
    try{
       const savedMessage=await Message.create({
        sender:fromUserId,
        receiver:toGroupId,
        receiverModel:"Group",
        message,
        mediaKey,
        isRead:false
       })
       io.to(toGroupId).emit("receivedGroupMessage",savedMessage);
      }
      catch(error){
       console.log("error",error);
      }
  })
  socket.on('disconnect', () => {
    const sockets=onlineUsers.get(userId);
    const updatedSockets=sockets.filter((id) => id !== socket.id) ;
      if(updatedSockets.length===0)
       onlineUsers.delete(userId);
      else
       onlineUsers.set(userId,updatedSockets);
    io.emit('online-users', Array.from(onlineUsers.keys())); 
  });
   })  


mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("dataBase connected successfully.");
})

server.listen(port,()=>{
    console.log(`server is running on port no :${port}`);
})





