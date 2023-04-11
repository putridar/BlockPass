import React from "react";
import block_pass_logo  from "../../../assets/images/logo.png";
import { Link } from "react-router-dom";

function Logo() {
    return (
        <Link to="/home" className="flex flex-row items-center">
            <img src={block_pass_logo} className="xs:h-10 md:h-10 lg:h-10 mr-2" alt="" />
            BlockPass
        </Link>
    )
}

export default Logo;