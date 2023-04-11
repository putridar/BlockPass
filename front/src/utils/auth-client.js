import { client, LOCAL_STORAGE_KEY } from "./client.js";

const USER_API_URL = process.env.REACT_APP_USER_API;

function handleUserResponse(user) {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, user.token);
    // redirect user to homepage
    window.location.replace('/');
    return user;
}

async function loginWithWallet(walletAddress, password) {
    const res = await client(`${USER_API_URL}/signin`, { body: { walletAddress, password } });

    handleUserResponse(res);
    return res;
}

async function signUp(username, walletAddress, email, password) {
    const res = await client(`${USER_API_URL}/signup`, { body: { username, password, email, walletAddress } });

    return res;
}

function getToken() {
    return window.localStorage.getItem(LOCAL_STORAGE_KEY);
}

async function loginWithToken() {
    const token = getToken();
    if (!token) {
        return Promise.resolve(null);
    }
    const res = await client(`${USER_API_URL}/signInWithToken`);
    
    return res;
}

async function logout() {
    window.localStorage.removeItem(LOCAL_STORAGE_KEY);
    // refreshes the page for the user
    window.location.assign(window.location);
}


export { loginWithWallet, loginWithToken, logout, signUp };