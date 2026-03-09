"use client"

import {createContext, ReactNode,useState,useEffect, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { chat_service, useAppData } from "./AppContext";

interface SocketContextType{
    socket: Socket |null;
    onlineUsers:string[];
}

const SocketContext =createContext<SocketContextType>({
    socket:null,
    onlineUsers:[],
});

interface ProviderProps{
    children:ReactNode;
}

export const SocketProvider = ({children} : ProviderProps)=>{
    const [socket, setsocket] = useState<Socket |null >(null);

    

    const {user} =useAppData();

    const [onlineUsers, setonlineUsers] = useState<string[]>([]);


    useEffect(() => {
      
        if(!user?._id)return ;

        const newsocket =io(chat_service,{
            query:{
                userId:user._id,
            }
        });
        setsocket(newsocket);

        newsocket.on("getOnlineUser",(users:string[])=>{
          
            setonlineUsers(users);
        });

    return ()=>{
        newsocket.disconnect();
    }
     
    }, [user?._id]);


    return (<SocketContext.Provider value={{socket,onlineUsers}} >{children}</SocketContext.Provider>);
    

};

export const SocketData = ()=> useContext(SocketContext);