import express, {type NextFunction, type Request, type Response} from "express";
import { User } from "../models/user.ts";
import { auth } from "../middleware/authMiddleware.ts"
import { type AuthRequest } from "../middleware/authMiddleware.ts";
import { sendWelcomeEmail, sendCancellationEmail } from "../emails/account.ts";
import multer from "multer";
import sharp from "sharp";

export const router= express.Router()
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Please upload an image file'));
        }

        cb(null, true);
    }
})

router.post("/users", async (req: Request, res: Response) => {
    const user = new User(req.body)

    try {
        await user.save()
        await sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e: any) {
        res.status(400).send(e)
    }
})

router.post("/users/login", async (req: Request, res: Response) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send()
    }
})

router.post("/users/logout", auth, async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.token) {
        return res.status(401).send();
    }

    try {
        req.user.tokens = req.user.tokens.filter(t => t.token !== req.token)
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.post("/users/logoutAll", auth, async (req: AuthRequest, res: Response) => {
    if (!req.user || !req.token) {
        return res.status(401).send();
    }

    try {
        req.user.tokens = []
        await req.user.save()
        res.send()
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/users/me', auth, async (req: AuthRequest, res: Response) => {
    res.send(req.user)
})

router.patch('/users/me', auth,async (req: AuthRequest, res: Response) => {
    const updates: string[] = Object.keys(req.body)
    const allowedUpdates: string[] = ['name', 'email', 'age', 'password']
    const isValidOperation: boolean = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) return res.status(400).send({error: 'Invalid operation'})

    try {
        const user = req.user!
        updates.forEach(update => (user as any)[update] = req.body[update])

        await user.save()
        res.send(user)
    } catch (e: any) {
        if (e.name === 'ValidationError') {
            return res.status(400).send({ error: e.message })
        }
        res.status(500).send({ error: 'Server error' })
    }
})

router.delete('/users/me', auth, async (req: AuthRequest, res: Response) => {
    try {
        await req.user?.deleteOne()
        await sendCancellationEmail(req.user?.email!, req.user?.name!)
        res.send(req.user)
    } catch (e) {
        res.status(500).send()
    }
})

router.post("/users/me/avatar", auth, upload.single("avatar"), async (req: AuthRequest, res: Response) => {
    const buffer = await sharp(req.file?.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    if (req.user && req.file) {
        req.user.avatar = buffer
        req.user.avatarMimeType = req.file.mimetype
        await req.user.save()
    }
    res.send()
}, (err: Error, req: AuthRequest, res: Response, next: NextFunction) => {
    res.status(400).send({error: err.message})
})

router.delete("/users/me/avatar", auth, async (req: AuthRequest, res: Response) => {
    await req.user?.updateOne({ $unset: { avatar: "", avatarMimeType : "" } });
    res.send()
})

router.get("/users/me/avatar", auth, async (req: AuthRequest, res: Response) => {
    if (!req.user?.avatar) return res.status(404).send()

    res.set('X-Content-Type-Options', 'nosniff');
    res.set("Content-Type", "image/*")
    res.send(req.user.avatar)
})