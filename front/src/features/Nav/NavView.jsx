import React from 'react';
import LoginButton from './components/LoginButton';
import Logo from './components/Logo';
import { useAuth, useUser } from "../../context/auth-context";

function NavView() {
    const user = useUser();
    const auth = useAuth();

    const logout = async () => {
        await auth.logout();
    }

    return (
        <div className='bg-gray-400 px-20 py-2 flex flex-row justify-between'>
            <Logo />
            <div>
                {
                    user ?
                    <div className='flex flex-row'>
                        <div>
                            { user.username }
                        </div>
                        <button onClick={logout} className='mx-4'>
                            Logout
                        </button>
                    </div>
                    :
                    <LoginButton />
                }
            </div>
        </div>
        
    );
}

export default NavView;