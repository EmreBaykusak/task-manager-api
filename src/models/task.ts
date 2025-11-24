import mongoose, { Schema, Model } from "mongoose";

interface ITask extends Document{
    description: string,
    completed: boolean,
    owner: Schema.Types.ObjectId
}

const TaskSchema = new Schema<ITask>({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "User",
    }
    }, {
    timestamps: true
})

export const Task: Model<ITask> = mongoose.model("Task", TaskSchema);