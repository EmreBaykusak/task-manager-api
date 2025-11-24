import "./db/mongoose.ts"
import express from "express"
import { router as userRouter } from "./routers/userRouter.ts"
import { router as taskRouter } from "./routers/taskRouter.ts"

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});