import mongoose, { type ConnectOptions } from "mongoose";

try {
    await mongoose.connect(process.env.CONNECTION_STRING!, {
        autoIndex: true
    } as ConnectOptions);

} catch (err) {
    console.error(err);
}