import * as path from 'path'
import { select, input, confirm, Separator } from '@inquirer/prompts';
import mongoose from 'mongoose'

async function selectMain() {
    return await select({
        message: "Admin Console",
        choices: [
            /*{
                name: "Create user",
                value: "create_user",
            },*/
            {
                name: "Drop database (danger)",
                value: 'drop_db'
            },
            {
                name: "Exit",
                value: "exit"
            }
        ]
    })
}

async function setup(){
    let exit = false
    while(!exit){
        const mainSelection = await selectMain()
        switch(mainSelection){
            case "create_user":
                {
                    console.log("Create user...")
                    const profile = {
                        "alias": await input({
                            message: "Insert alias for researchers (e.g., P1, P2, 'admin', ..):",
                            required: true
                        }),
                        "isKorean": await confirm({message: "Use Korean for this user?", required: true, default: true}),
                    }
                    console.log(profile)

                    console.log(process.env.MONGODB_URL + process.env.MONGODB_DBNAME)

                    await mongoose.connect(process.env.MONGODB_URL + process.env.MONGODB_DBNAME)
                    console.log(mongoose.connection)
                    console.log(mongoose.connection.collections)
                    const UserModel = mongoose.model("User")
                    const newUser = await new UserModel(profile).save()
                    console.log("Created new user: ", newUser.toJSON())
                    
                }break;
            case "drop_db":
                {
                    const confirmed = await confirm({message: "Do you want to drop the entire database? This operation cannot be undone."})
                    if(confirmed === true){
                        console.log("Drop database.")

                        console.log(process.env.MONGODB_URL + process.env.MONGODB_DBNAME)

                        const connection = await mongoose.connect(process.env.MONGODB_URL + process.env.MONGODB_DBNAME)
                        await connection.connection.db.dropDatabase()
                    }else{
                        console.log("Canceled.")
                    }
                }break;
            case "exit":
                {
                    console.log("Bye.")
                    exit = true
                }break;
        }
    }
}

setup().then()