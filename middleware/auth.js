import jwt from "jsonwebtoken";

export const verifyToken = async (req, res, next) => {
    try {
        const authorization = req.headers.authorization;

        if (!authorization) {
            return res.status(401).json({ message: "Authorization header missing" });
        }

        const token = authorization.split(" ")[1];

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.userId = payload.userId;
        req.role = payload.role;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
