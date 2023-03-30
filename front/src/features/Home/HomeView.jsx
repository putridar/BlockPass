import React from 'react';
import { useUser } from '../../context/auth-context';

function HomeView() {

    const user = useUser();

    return (
        <div>
            {
                user ?
                <div>
                    Welcome {user.username}!
                </div>
                :
                <div>
                    Home View
                </div>
            }
        </div>
        
    );
}

export default HomeView;
