import jwt from "jsonwebtoken";

export async function verifyUserToken(req, res, next) {
    if (!(req.body &&
        req.headers &&
        req.headers.authorization &&
        req.headers.authorization.split(" ")[0] === "Bearer")) {
        return res.status(401).json({ message: "Missing JWT token!" });
    }
    
    const privateKey = process.env.JWT_PRIVATE_KEY;
    
    const tokenFromUser = req.headers.authorization.split(" ")[1];

    try {
        const payload = jwt.verify(tokenFromUser, privateKey, function (err, decoded) {
            if (err) {
                throw err;
            }
            return decoded;
        });

        req.username = payload.username;
        req.walletAddress = payload.walletAddress;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Invalid JWT token!" });
    }
}