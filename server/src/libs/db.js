import mongoose from "mongoose"

export const connectDb = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_CONNECTIONSTRING)
        console.log("Connect database successfully")
    } catch (error) {
        console.log("Error to connect database: ", error)
        //to stop if can not connect to db
        process.exit(1)
    }
}