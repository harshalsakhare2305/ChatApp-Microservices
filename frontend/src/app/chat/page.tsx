"use client"
import ChatSlidebar from '@/src/components/ChatSlidebar';
import Loader from '@/src/components/Loader';
import { useAppData,User } from '@/src/context/AppContext'
import { log } from 'console';
import { useRouter } from 'next/navigation';
import React,{ useEffect,useState} from 'react'

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
  
  if(loading)return <Loader/>;
     
  return (
    <div className='min-h-screen flex bg-gray-900 text-white relative overflow-hidden'>
      <ChatSlidebar sidebarOpen={sidebarOpen} setSidebarOpen={setsidebarOpen} showAllUsers={showAllUser} users={users} loggedInUser={loggedInUser} chats={chats} selectedUser={selectedUser} setSelectedUser={setselectedUser} handleLogout={handleLogout} setShowAllUsers={setshowAllUser}/>
    </div>
  )
}

export default ChatApp
