import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, type IUser } from "../models/user.js";

interface JwtPayload {
    _id: string;
    iat?: number;
    exp?: number;
}

export interface AuthRequest extends Request {
    user?: IUser;
    token?: string;
}

export const auth = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.replace("Bearer ", "");
        if (!token) return res.status(401).send({ error: "Invalid token" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

        const user = await User.findOne({
            _id: decoded._id,
            "tokens.token": token
        });
        if (!user) return res.status(401).send({ error: "Please authenticate." });

        req.user = user;
        req.token = token;

        next();
    } catch (e) {
        res.status(500).send();
    }
};