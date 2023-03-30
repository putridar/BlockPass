import React from "react";
import { Link } from "react-router-dom";

function LoginButton() {
    return (
        <Link to="/login" className="flex flex-row items-center">
            Login Button
        </Link>
    )
}

export default LoginButton;