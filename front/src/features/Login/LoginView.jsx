import React, { useState } from 'react';
import { useAuth } from '../../context/auth-context';
import { getWalletAddress } from "../../utils/web3-client";
import { useNavigate } from "react-router-dom";


function LoginView() {

    const [walletAddress, setWalletAddress] = useState("");
    const [password, setPassword] = useState("");
    const navigate = useNavigate();
    const auth = useAuth();

    const submit = async (e) => {
        try {
            auth.login(walletAddress, password);
            navigate('/home');
        } catch (error) {
            
        }
    }

    return (
        <div className='p-2 m-20 flex justify-center border-2 border-black'>
            <form className='flex flex-col' onSubmit={submit}>
                <div className='flex flex-row'>
                    <div className='mx-2'>
                        Wallet Address
                    </div>
                    {
                        walletAddress ?
                        <div>
                            {walletAddress}
                        </div> :
                        <button type='button' onClick={() => getWalletAddress().then((res) => setWalletAddress(res))}>
                            Get Wallet Address
                        </button>
                    }
                </div>
                <div className='flex flex-row'>
                    <div className='mx-2'>
                        Password
                    </div>
                    <input type="password" className='border-2 border-black' onChange={(e) => setPassword(e.target.value)} />
                </div>
                <button type='submit'>Login</button>
                <div>
                    Doesn't have account? Click <a href='/signup'>here</a> to signup!
                </div>
            </form>
        </div>
        
    );
}

export default LoginView;