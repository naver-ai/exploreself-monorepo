import fs from 'fs-extra'
import dotenv from 'dotenv'
import path from 'path'
import { nanoid } from 'nanoid'
import { input, password } from '@inquirer/prompts';
import bcrypt from 'bcrypt';

const envPath = path.resolve(process.cwd(), ".env")
console.log(envPath)

if(fs.existsSync(envPath) == false){
    fs.createFileSync(envPath)
}

function makeExistingValidator(message) {
    return (input) => {
        if(input == null || input.trim().length == 0){
            return message
        }else{
            return true
        }
    }
}

const VITE_BLACKLISTS = ["OPENAI_API_KEY", "AUTH_SECRET", "MONGODB_URL", "MONGODB_DBNAME", "ADMIN_ID", "ADMIN_HASHED_PASSWORD"]

async function hashPassword(password){
    let hp = await bcrypt.hash(password.trim(), 10)
    console.log(hp)
    return hp
}

async function setup(){
    const env = dotenv.config({path: envPath})?.parsed || {}
 

    console.log(env, env["BACKEND_PORT"])

    const answers = {
        "BACKEND_PORT": env["BACKEND_PORT"] || await input({
            default: '3000',
            message: 'Insert Backend port number:',
            required: true,
            validate: (input) =>  {
                const pass = makeExistingValidator("Please enter a valid port number.")(input)
                if(pass !== true){
                    return pass
                }

                try{
                    Number.parseInt(input)
                    return true
                }catch(ex){
                    return "The port number must be an integer."
                }
            }
        }),
        "BACKEND_HOSTNAME": env["BACKEND_HOSTNAME"] || await input({
            default: '0.0.0.0',
            message: 'Insert Backend hostname WITHOUT protocol and port (e.g., 0.0.0.0, naver.com):',
            required: true,
            validate: makeExistingValidator("Please enter a valid hostname.")
        }),
        "AUTH_SECRET": env["AUTH_SECRET"] || await input({
            default: 'NaverAILabHCIELMI',
            message: 'Insert any random string to be used as an auth secret:',
            required: true,
            validate: makeExistingValidator("Please enter any text.")
        }),
        "MONGODB_URL": env["MONGODB_URL"] || await input({
            default: 'mongodb://localhost:27017/',
            message: "Insert a full URL to connect to MongoDB on the system.",
            required: true
        }),
        "MONGODB_DBNAME": env["MONGODB_DBNAME"] || await input({
            default: "reauthor",
            message: "Insert a DB name to store the app data.",
            required: true
        }),
        "OPENAI_API_KEY": env["OPENAI_API_KEY"] || await input({
            message: 'Insert OpenAI API Key:',
            required: true,
            validate: makeExistingValidator("Please enter a valid API key.")
        }),
        "ADMIN_HASHED_PW": env["ADMIN_HASHED_PW"] || await hashPassword(await password({
            message: 'Enter password for admin:',
            required: true,
            validate: makeExistingValidator("Please enter a valid password.")
        })),

        "ADMIN_ID": env["ADMIN_ID"] || nanoid()
    }

    for(const key of Object.keys(answers)){
        if(key.startsWith("VITE_") == false && VITE_BLACKLISTS.indexOf(key) === -1){
            answers[`VITE_${key}`] = answers[key]
        }
    }

    const envFileContent = Object.entries(answers)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(envPath, envFileContent, {encoding:'utf-8'})

    fs.copyFileSync(envPath, path.join(process.cwd(), "apps/frontend-web", ".env"))
}

setup().then()