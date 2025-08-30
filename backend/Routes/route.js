const express= require("express");
const { createGroup, addMember, storeUser, fetchUser,fetchchatHistory, getallUsers, getallGroups, fetchGroupChatHistory, uploadMediatoS3, updateUser, updateGroup } = require("../Controllers/controller");
const { checkJwt } = require("../middleware/middleware");

const router=express.Router();

router.post('/creategroup',checkJwt, createGroup);
router.post('/addmember',checkJwt,addMember);
router.post('/storeuser',checkJwt,storeUser);
router.get('/fetchusers',checkJwt,fetchUser)
router.get('/fetchgroups',checkJwt,getallGroups)
// @ts-ignore
router.post('/upload',checkJwt,uploadMediatoS3);
router.get('/fetchchathistory/:id1/:id2',checkJwt,fetchchatHistory);
router.get('/fetchgrouphistory/:groupId',checkJwt,fetchGroupChatHistory);
router.patch('/updateuser',checkJwt,updateUser);
router.patch('/updateGroup',checkJwt,updateGroup);



module.exports=router;