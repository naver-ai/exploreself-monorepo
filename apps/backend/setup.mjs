import fs from 'fs-extra'
import dotenv from 'dotenv'
import path from 'path'
import inquirer from 'inquirer'

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

const VITE_BLACKLISTS = [/*"OPENAI_API_KEY",*/ "AUTH_SECRET"]

async function setup(){
    const env = dotenv.config({path: envPath})

    const questions = []

    if(env.parsed?.["BACKEND_PORT"] == null){
        questions.push({
                type: 'input',
                name: 'BACKEND_PORT',
                default: '3000',
                message: 'Insert Backend port number:',
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
            })
    }

    if(env.parsed?.["BACKEND_HOSTNAME"] == null){
        questions.push({
                type: 'input',
                name: 'BACKEND_HOSTNAME',
                default: '0.0.0.0',
                message: 'Insert Backend hostname WITHOUT protocol and port (e.g., 0.0.0.0, naver.com):',
                validate: makeExistingValidator("Please enter a valid hostname.")
            })
    }

    if(env.parsed?.["AUTH_SECRET"] == null){
        questions.push({
                type: 'input',
                name: 'AUTH_SECRET',
                default: 'NaverAILabHCIELMI',
                message: 'Insert any random string to be used as an auth secret:',
                validate: makeExistingValidator("Please enter any text.")
            })
    }

    if(env.parsed?.["OPENAI_API_KEY"] == null){
        questions.push({
                type: 'input',
                name: 'OPENAI_API_KEY',
                message: 'Insert OpenAI API Key:',
                validate: makeExistingValidator("Please enter a valid API key.")
            })
    }


    const newObj = env.parsed

    if(questions.length > 0){
        const answers = await inquirer.prompt(questions)
        for(const key of Object.keys(answers)){
            newObj[key] = answers[key]
        }
    }

    for(const key of Object.keys(newObj)){
        if(key.startsWith("VITE_") == false && VITE_BLACKLISTS.indexOf(key) === -1){
            newObj[`VITE_${key}`] = newObj[key]
        }
    }

    const envFileContent = Object.entries(newObj)
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    fs.writeFileSync(envPath, envFileContent, {encoding:'utf-8'})

    fs.copyFileSync(envPath, path.join(process.cwd(), "apps/reauthor-monorepo", ".env"))
}

setup().then()