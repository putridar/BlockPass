
import { ormCreateUser as createUser } from "../model/user-orm.js";

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