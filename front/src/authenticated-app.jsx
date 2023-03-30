import React from "react";
import { Navigate, Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import HomeView from "./features/Home/HomeView"
import NavView from "./features/Nav/NavView";

function AuthenticatedApp() {

    return (
        <div>
            <Router>
                <NavView/>
                <Routes>
                    <Route path='/home' element= {<HomeView />} />
                    <Route path='/help' element= {<HomeView />} />
                    <Route path='/' element={ <Navigate to="/home" /> }/>
                    <Route path='*' element={ <Navigate replace to='/home' />} />
                </Routes>
            </Router>
        </div>
    );
}

export default AuthenticatedApp;