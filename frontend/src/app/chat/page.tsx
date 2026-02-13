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

export interface Message{
  _id:string;
  chatId:string;
  sender:string;
  text?:string;
  image?:{
    url:string;
    publicId:string;
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

      setmessages(data.messages);
      setuser(data.user);
      await fetchChats();


    } catch (error) {
      console.log(error);
      toast.error("Failed to load messages");

    }
    
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

  useEffect(() => {
    if(selectedUser){
      fetchchat();
    }
  }, [selectedUser]);
  
  
  if(loading)return <Loader/>;
     
  return (
    <div className='min-h-screen flex bg-gray-900 text-white relative overflow-hidden'>
      <ChatSlidebar sidebarOpen={sidebarOpen} setSidebarOpen={setsidebarOpen} showAllUsers={showAllUser} users={users} loggedInUser={loggedInUser} chats={chats} selectedUser={selectedUser} setSelectedUser={setselectedUser} handleLogout={handleLogout} setShowAllUsers={setshowAllUser} createChat={createChat}/>

      <div className="flex-1 flex-col justify-between p-4 backdrop-blur-xl bg-white/5 border-1 border-white/10 ">
       <ChatHeader user={user} setSidebarOpen={setsidebarOpen} isTyping={isTyping} />
      </div>
    </div>
  )
}

export default ChatApp
