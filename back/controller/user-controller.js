
import { ormCreateUser as createUser, ormGetUser as getUser } from "../model/user-orm.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export async function signUp(req, res) {
    try {
        const { username, walletAddress, email, password } = req.body;
        const saltRounds = parseInt(process.env.SALT_ROUNDS);
        
        if (username && walletAddress && email && password) {
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const resp = await createUser(username, hashedPassword, email, walletAddress);   

            if (resp.err) {
                return res
                .status(400)
                .json({ message: 'Could not create a new user!' });
            } else {
                return res
                    .status(201)
                    .json({ message: `Created new user ${username} successfully!` });
            }
        } else {
            return res
            .status(400)
            .json({ message: 'Username and/or Password are missing!' });
        }
    } catch (err) {
        return res
            .status(500)
            .json({ message: 'Database failure when creating new user!' });
    }
}

export async function signIn(req, res) {
    try {
        const { walletAddress, password } = req.body;
        if (walletAddress && password) {
            const resp = await getUser(walletAddress);   
            if (resp.err) {
                return res
                .status(400)
                .json({ message: 'Could not create a new user!' });
            } else {
                if (!bcrypt.compareSync(password, resp.password.stringValue)) {
                    return res
                    .status(401)
                    .json({ message: "Wrong password!" });
                }

                const token = generateToken(resp.username.stringValue, walletAddress);

                return res
                    .status(201)
                    .json({ username : resp.username.stringValue, token: token });
            }
        } else {
            return res
            .status(400)
            .json({ message: 'Username and/or Password are missing!' });
        }
    } catch (err) {
        return res
            .status(500)
            .json({ message: 'Database failure when signing in!' });
    }
}

export async function signInWithToken(req, res) {
    return res.status(201).json({
        message: `Successfully log ${req.body.username} in with token!`,
        username: req.username,
        walletAddress: req.walletAddress,
      });
}

export function generateToken(username, walletAddress) {
    const privateKey = process.env.JWT_PRIVATE_KEY;
    
    let token = jwt.sign(
        {
            username: username,
            walletAddress: walletAddress
        },
        privateKey,
        { expiresIn: '2h' }
        );
    return token;
}