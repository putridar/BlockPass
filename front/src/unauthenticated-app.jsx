import React from "react";
import { Navigate, Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import HomeView from "./features/Home/HomeView"
import LoginView from "./features/Login/LoginView";
import NavView from "./features/Nav/NavView";
import SignUpView from "./features/Signup/SignUpView";

function UnauthenticatedApp() {

    return (
        <div>
            <Router>
                <NavView/>
                <Routes>
                    <Route path='/' element= {<HomeView />} />
                    <Route path='/signup' element={<SignUpView />} />
                    <Route path='/login' element={<LoginView />} />
                    {/* <Route path='/' element={ <Navigate to="/home" /> }/>
                    <Route path='*' element={ <Navigate replace to='/home' />} /> */}
                </Routes>
            </Router>
        </div>
    );
}

export default UnauthenticatedApp;