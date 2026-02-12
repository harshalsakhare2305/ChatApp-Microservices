"use client"

import { createContext, useContext } from "react";
import { ReactNode,useState,useEffect } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import toast, {Toaster} from 'react-hot-toast'


export const user_service="http://localhost:3001";
export const chat_service="http://localhost:5000";


export interface User{
    _id:string;
    name:string;
    email:string;
}

export interface Chat{
    _id:string;
    users:string[];
    latestMessage:{
        text:string;
        sender:string;
    };
    createdAt:string;
    updatedAt:string;
    unseenCount?:number;
} 

export interface Chats{
    _id:string;
    user:User;
    chat:Chat;
}

interface AppContextType{
    user:User | null;
    loading:boolean;
    isAuth:boolean;
    setUser:React.Dispatch<React.SetStateAction<User | null>>;
    setIsAuth:React.Dispatch<React.SetStateAction<boolean>>;
    fetchChats: () => Promise<void>;
    logoutuser: () => Promise<void>;
    fetchUsers: ()=>Promise<void>;
    chats:Chats[] | null;
    users: User[] | null;
    setchats:React.Dispatch<React.SetStateAction<Chats[] | null>>;
    setusers:React.Dispatch<React.SetStateAction<User[] | null>>;
}

const AppContext=createContext<AppContextType |undefined >(undefined);


interface AppProviderProps{
    children: ReactNode;
}

export const AppProvider:React.FC<AppProviderProps>=({children})=>{
  const [user, setUser] = useState<User | null>(null);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setloading] = useState(true);

  async function fetchuser() {
    try {
        const token=Cookies.get("token");
        const {data}=await axios.get(`${user_service}/api/v1/me`,{
           headers:{
            Authorization:`Bearer ${token}`,
           },
        });

        setUser(data);
        setIsAuth(true);
        setloading(false);
    } catch (error) {
        console.log(error);
        setloading(false);
    }
    
  }

  async function logoutuser() {
    Cookies.remove("token");
    setUser(null);
    setIsAuth(false);
    toast.success("User Logged Out Successfully");
  }

  const [chats, setchats] = useState<Chats[] | null >(null);

  async function fetchChats() {
    const token =Cookies.get("token");

    if(!token){
        console.log("Token not found()");
        return ;
    }

    try {
        const {data}=await axios.get(`${chat_service}/api/v1/getchats`,{
            headers:{
                Authorization:`Bearer ${token}`,
            },
        });

        setchats(data.chats);
    } catch (error) {
        console.log(error);
    }
  }

  const [users, setusers] = useState<User[] | null >(null);

  async function fetchUsers() {
    const token=Cookies.get("token");

    try {
        const {data}=await axios.get(`${user_service}/api/v1/user/all`,{
            headers:{
                Authorization: `Bearer ${token}`,
            }
        });

        setusers(data);
    } catch (error) {
        console.log(error);
    }
  }

  

  useEffect(() => {
  fetchuser();
   fetchUsers();
}, []);

useEffect(() => {
  if (isAuth) {
   fetchChats();
  }
}, [isAuth]);


  

  return (<AppContext.Provider value={{user,setUser,isAuth,setIsAuth,loading,fetchChats,logoutuser,fetchUsers,chats,users,setchats,setusers}}>
  {children}
  <Toaster/>
  </AppContext.Provider>);
  
};

export const useAppData=():AppContextType=>{
    const context=useContext(AppContext);
    if(!context){
        throw new Error("Useappdata must be used within AppProvider");
    }

    return context;
}




