import { useCallback, useEffect, useState } from "react"
import { useSelector } from "../../../../redux/hooks"
import { IUserAllPopulated } from "@core"
import { usePrevious } from "@uidotdev/usehooks"
import { Button } from "antd"
import { Http } from "../../../../net/http"

function textLengthType(text: string | undefined): "none" | "short" | "long" {
    if(text == null || text.length < 2){
        return "none"
    }
    else if(text.length < 20){
        return "short"
    }else{
        return "long"
    }
} 

const TextPlaceholder = (props: {textLength: "none" | "short" | "long", className?: string}) => {
    return <div className={`flex flex-col gap-y-2 ${props.className}`}>
        {
            props.textLength == 'none' ? <div className="block h-0.5 w-3 bg-gray-600"/> : <>
             <div className="bg-white/50 block h-2"/>
        {
            props.textLength == 'long' ? <>
                <div className="bg-white/50 block h-2"/>
                <div className="bg-white/50 block h-2 w-[60%]"/>
                </> : null
        }</>
        }
     </div>   
}

export const ExplorationVis = (props: {
    excludedUserIds: {[key:string]:boolean}
}) => {
    const prevExcludedUserIds = usePrevious(props.excludedUserIds)

    const token = useSelector(state => state.admin.auth.token)


    const [users, setUsers] = useState<Array<IUserAllPopulated> | null>(null)

    const onDownloadUsersJSON = useCallback(async ()=>{
        try{
            const resp = await Http.axios.get("/admin/data/all", {
                params: {exclude: Object.keys(props.excludedUserIds).filter(id => props.excludedUserIds[id] === true)},
                headers: Http.makeSignedInHeader(token!)})
            
            setUsers(resp.data)
        }catch(ex){
            console.log(ex)
        }
    }, [token, props.excludedUserIds])


    useEffect(()=>{
        if(prevExcludedUserIds != props.excludedUserIds){
            //setUsers(null)
        }
    }, [prevExcludedUserIds, props.excludedUserIds])

    return <div>
        {
            users == null ? <Button onClick={onDownloadUsersJSON}>Refresh</Button> : <div className={`grid gap-5 grid-flow-cols grid-cols-6`}>
                {
                    users.map(user => {
                        return <div key={user._id}>
                            <div className="font-bold mb-2">{user.alias}</div>
                            {
                                user.initialNarrative != null ? <div className="bg-blue-400 p-2 rounded-md">
                                <TextPlaceholder textLength={textLengthType(user.initialNarrative)}/>
                            </div> : null
                            }
                            {
                                user.threads.map(thread=> {
                                    return <div key={thread._id} className="bg-slate-200 border-2 border-gray-300 p-2 rounded-md mt-1.5 border-t-[12px]">
                                        {
                                            thread.questions.filter(question => question.selected === true).map(question => {
                                                return <div key={question._id} className="bg-teal-400 p-2 rounded-md mt-1.5 first:mt-0">
                                                    <div className="flex flex-wrap gap-0.5 mb-2">
                                                        {
                                                            question.keywords.map((keywords, i) => {
                                                                return <div key={i} className="w-3 h-1.5 block rounded-full bg-rose-400"/>
                                                            })
                                                        }
                                                    </div>
                                                    <div className="flex gap-x-2">
                                                        <TextPlaceholder textLength={textLengthType(question.response)} className="flex-1"/>
                                                        <div className="grid grid-flow-cols grid-cols-2 flex-wrap gap-0.5">{
                                                            question.aiGuides?.map((guide, i) => {
                                                                return <div key={i} className="w-2 h-2 block bg-black rounded-full"/>
                                                            })
                                                        }</div>
                                                    </div>
                                                </div>
                                            })
                                        }
                                    </div>
                                })
                            }
                        </div>
                    })
                }
            </div>
        }
    </div>
}