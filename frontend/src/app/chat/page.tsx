"use client"
import ChatSlidebar from '@/src/components/ChatSlidebar';
import Loader from '@/src/components/Loader';
import { chat_service, useAppData,User } from '@/src/context/AppContext'
import { log } from 'console';
import { useRouter } from 'next/navigation';
import React,{ useEffect,useEffectEvent,useState} from 'react'
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';
import ChatHeader from '@/src/components/ChatHeader';
import ChatMessages from '@/src/components/ChatMessages';
import MessageInput from '@/src/components/MessageInput';
import { SocketData } from '@/src/context/SocketContext';

export interface Message{
  _id:string;
  chatId:string;
  sender:string;
  text?:string;
  image?:{
    url:string;
    public_id:string;
  };
  messageType:"text"|"image";
  seen:boolean;
  seenAt?:string;
  createdAt:string;
}



function ChatApp() {


const [selectedUser, setselectedUser] = useState<string | null >(null);
const [message, setmessage] = useState("");
const [sidebarOpen, setsidebarOpen] = useState(false);
const [messages, setmessages] = useState<Message[] | null>(null);
const [user, setuser] = useState< User | null >(null);
const [showAllUser, setshowAllUser] = useState(false);
const [isTyping, setisTyping] = useState(false);
const [typingTimeOut, settypingTimeOut] = useState<NodeJS.Timeout | null>(null);


  const {isAuth,loading,logoutuser,chats,user:loggedInUser,users,fetchChats,setchats} =useAppData();

  const  {onlineUsers,socket} =SocketData();

  // console.log("Data of Online Users",onlineUsers);

  const router =useRouter();

  useEffect(() => {
    

    if(!isAuth && !loading){
      router.push('/login'); 
   
    }
       
    
  }, [isAuth,router,loading]);

  const handleLogout=()=>logoutuser();

  async function fetchchat() {
    const token=Cookies.get("token");
    if(!token){
      console.log("Failed to get the token");
      return;
    }

    try {
      const {data}=await axios.get(`${chat_service}/api/v1/message/${selectedUser}`,{
        headers:{
          Authorization:`Bearer ${token}`,
        },
      });

      setmessages(data.allMessages);
      setuser(data.user);
      await fetchChats();
   

    } catch (error) {
      console.log(error);
      toast.error("Failed to load messages");

    }
    
  }

  const moveChatToTop =(chatId:string,newMessage:any,updatedUnseenCount=true)=>{
      
    setchats((prev)=>{  //We are doing functional update because we need the latest state of chats to move the chat to top when new message comes and also to update the unseen count of the chat
      if(!prev)return null;

      const updatedChats = [...prev]; // Create a copy of the chats array to avoid mutating the state directly

      // Find the index of the chat that matches the chatId
      const chatIndex =updatedChats.findIndex((chat)=>chat.chat.
    _id===chatId);

    if(chatIndex!==-1){
      // If the chat is found then remove that from array and return theat chat
      const [moveChat]=updatedChats.splice(chatIndex,1);

      //update the latest message and unseen count of that chat
      const updatedChat={
        ...moveChat,
        chat:{
          ...moveChat.chat,
          latestMessage:{
            text:newMessage.text,
            sender:newMessage.sender,
          },
          updatedAt:new Date().toString(),
          unseenCount:updatedUnseenCount && newMessage.sender !== loggedInUser?._id ? (moveChat.chat.unseenCount || 0) + 1 : moveChat.chat.unseenCount || 0,
        },
      };

      // Then add that chat to the top of the array

     updatedChats.unshift(updatedChat);

    
    }
     return updatedChats; 
    });
  };

   const resetUnseenCount =(chatId:string)=>{
        
    setchats((prev)=>{
      if(!prev)return null;

      return prev.map((chat)=>{
        if(chat.chat._id === chatId){
          return {
            ...chat,
            chat:{
              ...chat.chat,
              unseenCount:0,
            },
          };
        }
        return chat;
      })
    })
   }

  async function createChat(u:User) {
    try {
      const token=Cookies.get("token");
      if(!token){
        console.log("Token not found");
        return;
      }

      const {data}=await axios.post(`${chat_service}/api/v1/createchat`,{
        userId:loggedInUser?._id,
        otheruserid:u._id,
      },{
        headers:{
          Authorization: `Bearer ${token}`
        },
      }
        
      );

      setselectedUser(data.chatId);
      setshowAllUser(false); 
      await fetchChats();
    } catch (error) {
      toast.error("Failed to Start the Chat");
    }
  }

  const handleMessageSend =async (e:any,imageFile?:File | null )=>{
    e.preventDefault();

    if(!message.trim() && !imageFile )return ;


    if(!selectedUser)return;

    //Socket work

    if(typingTimeOut){
      clearTimeout(typingTimeOut);
      settypingTimeOut(null);
    }

    socket?.emit("stopTyping",{
      chatId:selectedUser,
      userId:loggedInUser?._id,
    })

    const token =Cookies.get("token");
    if(!token){
      console.log('Token not Found');
      return ;
    }

    

    try {
      const formData=new FormData();

      formData.append("chatId",selectedUser);

      if(message.trim()){
        formData.append("text",message )
      }

      if(imageFile){
        formData.append("image",imageFile);
      }


      const {data} =await axios.post(`${chat_service}/api/v1/message/`,formData, {
         headers:{
          Authorization:`Bearer ${token}`,
          "Content-Type":"multipart/form-data",
         },
      });

      setmessages((prev)=>{
        const currentMessages =prev || [];
        const messageExists =currentMessages.some((msg)=>msg._id===data.message._id);

         if(!messageExists){
          return [...currentMessages,data.message]
         }

         return currentMessages;
      });

      setmessage("");

     const displayText =imageFile ? "📷 image":message;

     moveChatToTop(selectedUser,{
      text:displayText,
      sender:data.sender,
     },false);



    } catch (error:any) {
 toast.error(
    error?.response?.data?.message ||
    error?.message ||
    "Something went wrong"
  );
    }
  }

  const handleTyping =(value:string)=>{
     setmessage(value);

     if(!selectedUser ||  !socket)return ;


     //Socket setup

     if(value.trim()){
      socket.emit("typing",{
        chatId:selectedUser,
        userId:loggedInUser?._id,
      })
     }

     if(typingTimeOut){
      clearTimeout(typingTimeOut);
     }
 
     const timeout=setTimeout(()=>{
      socket.emit("stopTyping",{
         chatId:selectedUser,
        userId:loggedInUser?._id,
      })
     },2000);

     settypingTimeOut(timeout);


  }

  useEffect(() => {

   socket?.on("newMessage",(message)=>{
    console.log("Recived new message: ",message);

    if(selectedUser === message.chatId){
      setmessages((prev)=>{
        const currentMessages =prev || [];
        const messageExists =currentMessages.some((msg)=>msg._id===message._id);

          if(!messageExists){
            return [...currentMessages,message]
          }

          return currentMessages;
      });
      moveChatToTop(message.chatId,message,false);
    }else{
      moveChatToTop(message.chatId,message,true);
    }
   });

   socket?.on("messageSeen",(data)=>{
    console.log("Message Seen By : ",data);

    if(selectedUser === data.chatId){
      setmessages((prev)=>{
        if(!prev)return prev;

        return prev.map((msg)=>{
          if(msg.sender === loggedInUser?._id && data.messageIds &&data.messageIds.includes(msg._id)){
            return {...msg, seen: true,seenAt: new Date().toString()};
          }else if(msg.sender === loggedInUser?._id && !data.messageIds){
            return {...msg, seen: true,seenAt: new Date().toString()};
          }
          return msg;
        })
      })
    }
   })



    
   socket?.on("userTyping",(data)=>{
    console.log("Recieved User Typing",data);

    if(data.chatId === selectedUser && data.userId !== loggedInUser?._id){
      setisTyping(true);
    }

   });

   socket?.on("userStoppedTyping",(data)=>{
    console.log("Recieved User Typing",data);

    if(data.chatId === selectedUser && data.userId !== loggedInUser?._id){
      setisTyping(false);
    }

   });


   return ()=>{
    socket?.off("newMessage");
    socket?.off("messageSeen");
    socket?.off("userTyping");
    socket?.off("userStoppedTyping");
   }


    
  }, [socket,selectedUser,setchats,loggedInUser?._id]);
  

  useEffect(() => {
    if(selectedUser){
      fetchchat();
      setisTyping(false);

      resetUnseenCount(selectedUser);

      socket?.emit("joinChat",selectedUser);
      return ()=>{
        socket?.emit("leaveChat",selectedUser);
        setmessages(null);
      }
    }
  }, [selectedUser,socket]);
  

  useEffect(() => {
    

    return ()=>{
      if(typingTimeOut){
        clearTimeout(typingTimeOut);
      }
    }
  
   
  }, [typingTimeOut])
  
  
  
  if(loading)return <Loader/>;
     
  return (
    <div className='min-h-screen flex bg-gray-900 text-white relative overflow-hidden'>
      <ChatSlidebar sidebarOpen={sidebarOpen} setSidebarOpen={setsidebarOpen} showAllUsers={showAllUser} users={users} loggedInUser={loggedInUser} chats={chats} selectedUser={selectedUser} setSelectedUser={setselectedUser} handleLogout={handleLogout} setShowAllUsers={setshowAllUser} createChat={createChat} onlineUsers={onlineUsers}/>

      <div className="flex-1 flex flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-1 border-white/10 ">
       <ChatHeader user={user} setSidebarOpen={setsidebarOpen} isTyping={isTyping} onlineUsers={onlineUsers} />

       <ChatMessages selectedUser={selectedUser} messages={messages} loggedInUser={loggedInUser} />

       <MessageInput selectedUser={selectedUser} message={message} setMessage={handleTyping} handleMessageSend={handleMessageSend}  />
      </div>
    </div>
  )
}

export default ChatApp
