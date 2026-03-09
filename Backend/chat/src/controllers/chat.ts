import TryCatch from "../config/TryCatch.js";
import type { AuthenticationRequest } from '../middlewares/isAuth.js'

import type { Response } from "express";
import { Chat } from "../models/Chat.js";
import axios, { all } from "axios";
import { Message } from "../models/Messages.js";
import { getRecieverSocketId, io, io } from "../config/socket.js";


export const CreatenewChat = TryCatch(async (req: AuthenticationRequest, res: Response) => {
    const userid = req.user?._id;
    const { otheruserid } = req.body;

    if (!otheruserid) {
        res.status(400).json({
            message: "Other user is not found"
        });
        return;
    }

    const existingChat = await Chat.findOne({
        users: {
            $all: [userid, otheruserid], $size: 2,
        }
    });

    if (existingChat) {
        res.json({
            message: "Chat already Exist between both users",
            chatId: existingChat._id
        });
        return;
    }

    const newChat = await Chat.create({ users: [userid, otheruserid] });

    res.json(201).json({
        message: "New Chat is Created Successfully",
        chatId: newChat._id
    });
});


export const getAllChats = TryCatch(async (req: AuthenticationRequest, res: Response) => {
    const userid = req.user?._id;

    if (!userid) {
        res.status(400).json({
            message: "Bad Reqeust - plz login first that's why user not found"
        });

        return;
    }
       

    const allChats = await Chat.find({
        users: { $elemMatch: { $eq: userid } }
    }).sort({ updatedAt: -1 });

  



    const chatWith = await Promise.all(allChats.map(async (chat) => {
        const otheruserid = chat.users.find((id) => id.toString() !== userid.toString());

        const unseenCount= await Message.countDocuments({
            chatId:chat._id,
            seen:false,
            sender:{$ne:userid.toString()},
        });
      
       
        try {
            const {data} =await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/user/${otheruserid}`);
            
          
            return {
                user:data,
                chat:{
                    ...chat.toObject(),
                    latestMessage:chat.latestMessage || null,
                    unseenCount,
                },
            };

        } catch (error) {
            console.log(error);
            return {
                user:{_id:otheruserid, name:"Unknown", email:"Unknown"},
                 chat:{
                    ...chat.toObject(),
                    latestMessage:chat.latestMessage || null,
                    unseenCount,
                },
            };
        }
    }));

    

res.json({
    chats:chatWith,
});
});

export const SendMessage=TryCatch(async (req:AuthenticationRequest,res:Response)=>{
   const senderId=req.user?._id;
   const {chatId,text}=req.body;
  const imageFile = req.file as any;

 //console.log(imageFile);

   if(!senderId){
    res.status(401).json({
        message:"Sender not found-please login"
    });
    return;
   }

    if(!chatId){
    res.status(400).json({
        message:"Chat id is required"
    });
    return;
   };

   if(!text && !imageFile){
    res.status(400).json({
        message:"Either text or image is required to send message"
    });
    return;
   }


   
   const chat =await Chat.findById(chatId);
  
   if(!chat){
    res.status(404).json({
        message:"Chat not found"
    });
    return;
   }

   const isUserInChat=chat.users.find((id)=>id.toString()===senderId.toString());

   if(!isUserInChat){
    res.status(403).json({
        message:"You are not a member of this chat"
    });
    return;
   }

   const otheruserId=chat.users.find((id)=>id.toString()!==senderId.toString());

   if(!otheruserId){
    res.status(401).json({
        message:"Receiver not found"
    });
    return;
   }

   //Socket.io Setup

   const receiverSocketId=getRecieverSocketId(otheruserId.toString());
   
   let isRecieverChatRoom =false;

   if(receiverSocketId){
    //io.sockets.sockets is a Map of all connected sockets.

//     Map {
//    socketId1 → socket object
//    socketId2 → socket object
//    socketId3 → socket object
// }
    const receiverSocket =io.sockets.sockets.get(receiverSocketId);

    //Every socket has a set of rooms it belongs to.
    if(receiverSocket && receiverSocket.rooms.has(chatId)){
       isRecieverChatRoom=true;
    }
   }

   let messageData:any ={
    chatId:chatId,
    sender:senderId,
    seen:isRecieverChatRoom, // If receiver is in the chat room then mark message as seen otherwise unseen
    seenAt:isRecieverChatRoom ? new Date() : null, // If receiver is in the chat room then set seenAt otherwise null
   };

   if(imageFile){
    console.log("The image file path is ",imageFile.path)
    messageData.image={
        url:imageFile.secure_url,
        public_id:imageFile.public_id,
    };
    messageData.messageType="image";
    messageData.text=text || "";
   }else{
    messageData.text=text;
    messageData.messageType="text";
   }

   const message=new Message(messageData);
    const savedmessage= await message.save();

  const latestMessageText=imageFile?"📷 Image ":text;
  await Chat.findByIdAndUpdate(chatId,{
    latestMessage:{
        text:latestMessageText,
        sender:senderId,
    },
    updatedAt:new Date(),
  },{new:true});






  //Emit to Socket.io
  
    io.to(chatId).emit("newMessage",savedmessage);

    if(receiverSocketId){
        io.to(receiverSocketId).emit("newMessage",savedmessage);
       }

     const senderSocketId =getRecieverSocketId(senderId.toString());
       if(senderSocketId){
        io.to(senderSocketId).emit("newMessage",savedmessage);
    }

    if(isRecieverChatRoom && senderSocketId){
      io.to(senderSocketId).emit("messageSeen",{
        chatId:chatId,
        seenBy:otheruserId,
        messageIds:[savedmessage._id],
      });
    }

  res.status(201).json({
    message:savedmessage,
    sender:senderId,
  });
});


export const getMessagesByChat=TryCatch(async (req:AuthenticationRequest,res:Response)=>{
    const userId=req.user?._id;
    const {chatId}=req.params;

    if(!userId){
        res.status(401).json({
            message:"User not found- please login"
        });
        return;
    }
   
    if(!chatId){
        res.status(400).json({
            message:"Chat id is required"
        });
        return;
    }

    const chat=await Chat.findById(chatId);
    
    if(!chat){
        res.status(404).json({
            message:"Chat not found"
        });
        return;
    }
  
     const isUserInChat=chat.users.find((id)=>id.toString()===userId.toString());

   if(!isUserInChat){
    res.status(403).json({
        message:"You are not a member of this chat"
    });
    return;
   }

   const messageToSeen= await Message.find({
    chatId:chatId,
    sender:{$ne:userId.toString()},
    seen:false,
   });

   await Message.updateMany({
     chatId:chatId,
    sender:{$ne:userId.toString()},
    seen:false,
   },{
    seen:true,
    seenAt:new Date(),
   });
   
   const allMessages=await Message.find({chatId}).sort({createdAt:1});

   const otherUserId=chat.users.find((id)=>id.toString()!==userId.toString());

   try {
       const {data} =await axios.get(`${process.env.USER_SERVICE_URL}/api/v1/user/${otherUserId}`);

       if(!otherUserId){
        res.status(400).json({
            message:"No Other User"
        });

        return;
       }

       //Socket Work
      
       if(messageToSeen.length > 0){
        const otherUserSocketId =getRecieverSocketId(otherUserId.toString());   
        if(otherUserSocketId){
            io.to(otherUserSocketId).emit("messageSeen",{
                chatId:chatId,
                seenBy:userId,
                messageIds:messageToSeen.map((msg)=>msg._id),
            });
        }

    }


       res.json({
        allMessages,
        user:data,
       });
   } catch (error) {
    console.log(error);
    res.json({
        allMessages,
        user:{_id:otherUserId,name:"Unknown User"}
    });
   }






 
})
