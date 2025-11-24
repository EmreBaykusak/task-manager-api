import express, { type Response } from "express";
import { Task } from "../models/task.ts"
import { auth } from "../middleware/authMiddleware.ts"
import { type AuthRequest } from "../middleware/authMiddleware.ts";
import { isValidObjectId } from "mongoose";
import { Types } from "mongoose";

export const router = express.Router();

router.post("/tasks", auth,async (req: AuthRequest, res: Response) => {
    const task = new Task({
        ...req.body,
        owner: req.user?._id,
    })
    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})

router.get('/tasks', auth,async (req: AuthRequest, res: Response) => {
    const filter: { owner: Types.ObjectId; completed?: boolean} = {
        owner: req.user!._id as Types.ObjectId
    };

    if (req.query.completed !== undefined) filter.completed = req.query.completed === "true"

    const sortParts: string[] = (req.query.sortBy as string).split(":")
    const sortField: string = sortParts[0] ?? ""
    const sortPrefix: string = sortParts[1] === "desc" ? "-" : ""

    let query = Task.find(filter)
        .sort(sortPrefix + sortField);

    if (req.query.limit !== undefined) query = query.limit(parseInt(req.query.limit as string, 10));

    if (req.query.skip !== undefined) query = query.skip(parseInt(req.query.skip as string, 10));

    try {
        const tasks = await query;
        res.send(tasks)
    } catch (e) {
        res.status(500).send()
    }
})

router.get('/tasks/:id', auth, async (req: AuthRequest, res: Response) => {
    const _id = req.params.id

    if(!isValidObjectId(_id)) {
        return res.status(400).send()
    }

    try {
        const task = await Task.findOne({ _id, owner: req.user?._id })

        if (!task) {
            return res.status(404).send('Task not found')
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})

router.patch('/tasks/:id', auth, async (req: AuthRequest, res: Response) => {
    const updates: string[] = Object.keys(req.body)
    const allowedUpdates: string[] = ['description', 'completed']
    const isValidOperation: boolean = updates.every(update => allowedUpdates.includes(update))
    if (!isValidOperation) return res.status(400).send({error: 'Invalid operation'})

    const id = req.params.id!
    if(!isValidObjectId(id)) {
        return res.status(400).send()
    }

    try {
        const task = await Task.findOne({ _id: id, owner: req.user?._id })
        if (!task) return res.status(404).send('Task not found')

        updates.forEach((update) => {
            (task as any)[update] = req.body[update]
        })

        await task.save()
        res.send(task)
    } catch (e: any) {
        if (e.name === 'ValidationError') {
            return res.status(400).send({error: e.message})
        }
        res.status(500).send()
    }
})

router.delete('/tasks/:id', auth, async (req: AuthRequest, res: Response) => {
    const id = req.params.id!
    if(!isValidObjectId(id)) {
        return res.status(400).send()
    }

    try {
        const task = await Task.findOneAndDelete({ _id: id, owner: req.user?._id })
        if (!task) {
            return res.status(404).send('Task not found')
        }
        res.send(task)
    } catch (e) {
        res.status(500).send()
    }
})