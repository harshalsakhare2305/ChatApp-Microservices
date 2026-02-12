"use client";
import { ArrowRight, Loader2, Mail } from 'lucide-react'
import React, { useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import axios from 'axios';

import { useAppData, user_service } from '@/src/context/AppContext';
import Loader from '@/src/components/Loader';
import toast from 'react-hot-toast';

  

function LoginPage() {
    const [email, setemail] = useState<string>("");
    const [loading, setloading] = useState<boolean>(false);
    const router = useRouter();

    const {isAuth,loading:userLoading} =useAppData();

    const handleSubmit = async (e: React.FormEvent<HTMLElement>): Promise<void> => {
        e.preventDefault();
        setloading(true);

        try {
            const { data } = await axios.post(`${user_service}/api/v1/login`, {
                email,
            });

            toast.success(data.message);
            router.push(`/verify?email=${email}`);
        } catch (error: any) {
            toast.error(error.response?.data.message);
        } finally {
            setloading(false);
        }
    };

    if(userLoading)return <Loader/>;
    if(isAuth)return redirect('/chat');
    return (
        <div className='min-h-screen bg-gray-900 flex items-center justify-center p-4 '>
            <div className='max-w-md w-full '>
                <div className='bg-gray-800 border border-gray-700 rounded-lg p-8'>
                    <div className='text-center mb-8'>
                        <div className='mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6' >
                            <Mail size={40} className='text-white' />
                        </div>
                        <h1 className='text-4xl font-bold text-white mb-3'>
                            Welcome To ChatApp
                        </h1>

                        <p className='text-gray-300 text-lg'>Enter you email to continue...</p>
                    </div>
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div>
                            <label htmlFor="email" className='block text-sm font-medium text-gray-300 mb-2'>Email Address</label>
                            <input type="email" id='email' className='w-full px-4 py-4 bg-gray-700 border-gray-600 rounded-lg text-white placeholder-gray-400 ' placeholder='Enter Your Email Address' value={email} onChange={e => setemail(e.target.value)} required />

                        </div>
                        <button type='submit' className='w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed' disabled={loading}>
                            {
                                loading ? <div  className='flex items-center justify-center gap-2'>
                                    <Loader2 className='w-5 h-5'/>
                                    Sending OTP to Your Mail...
                                </div>
                                    :
                                    <div className='flex items-center justify-center gap-2'><span>Send Verification Code</span>
                                        <ArrowRight className='w-5 h-5' />
                                    </div>
                            }

                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
