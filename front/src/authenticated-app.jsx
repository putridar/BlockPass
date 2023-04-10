import React from "react";
import { Navigate, Routes, Route, BrowserRouter as Router } from 'react-router-dom';
import HomeView from "./features/Home/HomeView"
import Interaction from "./features/interaction/Interactions";
import NavView from "./features/Nav/NavView";
import MarketHome from "./features/Market/MarketHome";
import MarketBuy from "./features/Market/MarketBuy";
import MarketSell from "./features/Market/MarketSell";

function AuthenticatedApp() {

    return (
        <div>
            <Router>
                <NavView/>
                <Routes>
                    <Route path='/home' element= {<Interaction />} />
                    <Route path='/help' element= {<HomeView />} />
                    <Route path='/' element={ <Navigate to="/home" /> }/>
                    <Route path='*' element={ <Navigate replace to='/home' />} />
                    <Route path='/market' element={ <MarketHome />} />
                    <Route path='/market/buy' element={ <MarketBuy />} />
                    <Route path='/market/sell' element={ <MarketSell />} />
                </Routes>
            </Router>
        </div>
    );
}

export default AuthenticatedApp;