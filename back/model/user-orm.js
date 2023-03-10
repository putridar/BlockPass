import {
    addUser,
    getUser
} from './repository.js';

export async function ormCreateUser(username, password, email, walletAddress) {
    try {
        await addUser(username, password, email, walletAddress);
        return true;
    } catch (err) {
        return { err };
    }
}

export async function ormGetUser(walletAddress) {
    try {
        const user = await getUser(walletAddress);
        return user;
    } catch (err) {
        return { err };
    }
}