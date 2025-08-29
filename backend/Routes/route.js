const express= require("express");
const { createGroup, addMember, storeUser, fetchUser,fetchchatHistory, getallUsers, getallGroups, fetchGroupChatHistory, uploadMediatoS3 } = require("../Controllers/controller");
const { checkJwt } = require("../middleware/middleware");

const router=express.Router();

router.post('/creategroup',checkJwt, createGroup);
router.post('/addmember',checkJwt,addMember);
router.post('/storeuser',checkJwt,storeUser);
router.get('/fetchusers',checkJwt,fetchUser)
router.get('/fetchgroups',checkJwt,getallGroups)
router.post('/upload',checkJwt,uploadMediatoS3);
router.get('/fetchchathistory/:id1/:id2',checkJwt,fetchchatHistory);
router.get('/fetchgrouphistory/:groupId',checkJwt,fetchGroupChatHistory);



module.exports=router;