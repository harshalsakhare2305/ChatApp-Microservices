"use client";
import axios from 'axios';
import { ArrowRight, Loader2, Lock ,ChevronLeft } from 'lucide-react'
import { useSearchParams,useRouter, redirect } from 'next/navigation';
import React, { useRef, useState,useEffect } from 'react';
import { clearInterval,setInterval } from 'timers';
import Cookies from 'js-cookie';
import { useAppData, user_service } from '@/src/context/AppContext';
import Loader from './Loader';
import toast from 'react-hot-toast';




function Verifyotp() {
     
    const {isAuth,setIsAuth,setUser,loading: userLoading,fetchChats,fetchUsers}=useAppData();
    const [loading, setloading] = useState<boolean>(false);
    const [otp, setotp] = useState<string[]>(["","","","","",""]);
    const [error, seterror] = useState<string>("");
    const [resendLoading, setresendLoading] = useState<boolean>(false);
    const [timer, settimer] = useState(60);

    const inputRefs =useRef<Array<HTMLInputElement | null >>([]) ;
    const router =useRouter();

    const searchParams=useSearchParams();
    
    const email =searchParams.get("email") || "";

    useEffect(() => {
    
      if(timer>0){
        const interval=setInterval(()=>{
          settimer((prev)=> prev-1);
        },1000);
        return ()=> clearInterval(interval);
      }

    }, [timer]);

   
    const handleInputChange=(index:number,value:string)=>{
      if(value.length>1)return ;
      const newotp=[...otp];
      newotp[index]=value;
      setotp(newotp);
      seterror("");

      if(value && index<5){
        inputRefs.current[index+1]?.focus();
      }

    };

    const handlekeydown=(index:number,e: React.KeyboardEvent<HTMLElement>):void=>{
        if(e.key==="Backspace" && !otp[index] && index>0 ){
           inputRefs.current[index-1]?.focus()
        }
    };

    const handlePaste = (e:React.ClipboardEvent<HTMLInputElement>):void=>{
      const pastedData=e.clipboardData.getData("text");
      const digits=pastedData.replace(/\D/g,"").slice(0,6);

      if(digits.length==6){
        const newotp=digits.split("");
        setotp(newotp);
        inputRefs.current[5]?.focus();
      }
    }
    
    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>)=>{ 
      e.preventDefault();

      const otpstring=otp.join("");
      if(otpstring.length!==6){
        seterror("Please Enter all 6 Digits");
        return;
      }
      
      seterror("");
      setloading(true);

      try {
        const {data}=await axios.post(`${user_service}/api/v1/verify`,{
          email,
          otp:otpstring,
        });

        toast.success(data.message);
        Cookies.set("token",data.token,{
          expires:15,
          secure:false,
          path:'/'
        });

        console.log(document.cookie);

        setotp(["","","","","",""]);
        inputRefs.current[0]?.focus();

        //SetIsAuth && Router.push();
        setUser(data.user);
        setIsAuth(true);
        fetchChats();
        fetchUsers();
      } catch (error:any) {
        seterror(error.response.data.message);

      }finally{
        setloading(false);
      }

    }

    const handleResendOtp =async ()=>{
      setresendLoading(true);
      seterror("");
      try {
         const { data } = await axios.post(`${user_service}/api/v1/login`, {
                email,
            });

            toast.success(data.message);

            settimer(60);


      } catch (error:any) {
            seterror(error.response.data.message);
      }finally{
        setresendLoading(false);
      }
    }

    if(userLoading)return <Loader/>

    if(isAuth)redirect('/chat');

  return (
   <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4 '>
            <div className='max-w-md w-full '>
                <div className='bg-gray-800 border border-gray-700 rounded-lg p-8'>
                    <div className='text-center mb-8 relative '>
                      <button className='absolute top-0 left-0 p-2 text text-gray-300 hover:text-white'>
                        <ChevronLeft className='w-6 h-6' onClick={()=>{router.push('/login')}}/>
                      </button>
                        <div className='mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6' >
                            <Lock size={40} className='text-white' />
                        </div>
                        <h1 className='text-4xl font-bold text-white mb-3'>
                            Verify Your Email
                        </h1>

                        <p className='text-gray-300 text-lg'>Six Digit Verification  Code Sent To </p>
                        <p className='text-blue-400 font-medium'>{email}</p>
                    </div>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label  className='block text-sm font-medium text-gray-300 mb-4 text-center'>Enter Your 6 Digit-Verification Code Here</label>
                            <div className='flex  justify-center in-checked: space-x-3'>
                              {
                                otp.map((digit,index)=>(
                                  <input key={index} ref={(el:HTMLInputElement | null )=>{
                                    inputRefs.current[index]=el;
                                  }} 
                                  type='text'
                                  maxLength={1}
                                  value={digit} 
                                  onChange={e=>handleInputChange(index,e.target.value)}
                                  onKeyDown={e=>handlekeydown(index,e)}
                                  onPaste={index==0?handlePaste:undefined}
                                  className='w-12 h-12 text-center text-xl font-bold border-2 border-gray-600 rounded-lg bg-gray-700 text-white'
                                  />
                                ))
                              }
                            </div>
                          

                        </div>
                       {
                        error && <div className='bg-red-900 boarder-red-700 rounded-lg p-3 '>
                          <p className='text-red-300 text-sm text-center'>{error}</p>
                        </div>
                       }
                
                         
                        <button type='submit' className='w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed' disabled={loading}>
                            {
                                loading ? <div  className='flex items-center justify-center gap-2'>
                                    <Loader2 className='w-5 h-5'/>
                                     Verifying OTP...
                                </div>
                                    :
                                    <div className='flex items-center justify-center gap-2'><span>Submit</span>
                                        <ArrowRight className='w-5 h-5' />
                                    </div>
                            }

                        </button>
                    </form>

                    <div className='mt-6 text-center '>
                      <p className="text-gray-400 text-sm mb-4">
                        Did'nt receive the code?
                      </p>
                      {
                        timer>0? <p className='text-gray-400 text-sm '>Resend Code in {timer} seconds</p> : <button className='text-blue-400 hover:text-blue-300 font-medium text-sm disabled:opacity-50 ' disabled={resendLoading} onClick={handleResendOtp}>
                          {resendLoading? "Sending..." : "Resend Code"}
                        </button>
                      }
                    </div>
                </div>
            </div>
        </div>
  )
}

export default Verifyotp;
