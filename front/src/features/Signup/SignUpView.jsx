import React, { useState } from 'react';
import { getWalletAddress } from "../../utils/web3-client";
import { signUp } from "../../utils/auth-client";
import { useNavigate } from "react-router-dom";

function SignUpView() {
    const [form, setForm] = useState({});
    const [walletAddress, setWalletAddress] = useState("");
    const [disableSubmit, setDisableSubmit] = useState(true);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name] : e.target.value,
        });
    }

    const submit = async (e) => {
        signUp(form.username, walletAddress, form.email, form.password);
    }

    return (
        <div className='p-2 m-20 flex justify-center border-2 border-black'>
            <form className='flex flex-col text-center' action="" onSubmit={submit}>
                Sign up Form
                <div className='flex flex-row'>
                    <div className='mx-2'>
                        Wallet Address
                    </div>
                    {
                        walletAddress ?
                        <div>
                            {walletAddress}
                        </div> 
                        :
                        <button type='button' onClick={() => getWalletAddress().then((res) => setWalletAddress(res))}>
                            Get Wallet Address
                        </button>
                    }
                </div>
                <div className='flex flex-row'>
                    <div className='mx-2'>
                        Username
                    </div>
                    <input type="text" className='border-2 border-black' name="username" onChange={handleChange} />
                </div>
                <div className='flex flex-row'>
                    <div className='mx-2'>
                        Email
                    </div>
                    <input type="text" className='border-2 border-black' name="email" onChange={handleChange} />
                </div>
                <div className='flex flex-row'>
                    <div className='mx-2'>
                        Password
                    </div>
                    <input type="password" className='border-2 border-black' name="password" onChange={handleChange} />
                </div>
                <div className='flex flex-row'>
                    <div className='mx-2'>
                        Confirm Password
                    </div>
                    <input type="password" className='border-2 border-black' onChange={(e) => setDisableSubmit(e.target.value !== form.password || !form.password)} />
                </div>
                <button type='submit' disabled={disableSubmit}>Sign Up</button>

            </form>
        </div>
        
    );
}

export default SignUpView;