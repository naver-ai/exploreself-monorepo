import { useCallback, useEffect, useState } from "react"
import { useSelector } from "../../../../redux/hooks"
import { IUserAllPopulated, InteractionObj, InteractionType } from "@core"
import { usePrevious } from "@uidotdev/usehooks"
import { Button } from "antd"
import { Http } from "../../../../net/http"
import { documentToSVG, elementToSVG, inlineResources } from 'dom-to-svg'
import FileSaver from "file-saver"
import moment from 'moment'

/*
function textLengthType(text: string | undefined): "none" | "short" | "long" {
    if(text == null || text.length < 2){
        return "none"
    }
    else if(text.length < 20){
        return "short"
    }else{
        return "long"
    }
}*/

function numLines(text: string | undefined): number {
    if(text == null || text.length < 2){
        return 0
    }
    else return Math.ceil(text.length / 20)
}

const MAX_LINE_CLAMP = 4

const TextPlaceholder = (props: {numLines: number, className?: string}) => {
    const isNumLineClamped = props.numLines > MAX_LINE_CLAMP
    const numLineClamped = Math.min(MAX_LINE_CLAMP, props.numLines)
    
    return <div className={`flex flex-col gap-y-1 ${props.className}`}>
        {
            props.numLines == 0 ? <div className="block h-0.5 w-3 bg-gray-600"/> : <>{Array.from(new Array(numLineClamped).keys()).map((_, i) => {
                    return <div key={i} className={`bg-white/70 block h-[5px] ${i == numLineClamped - 1 && numLineClamped > 1 && isNumLineClamped ==false ? "w-[60%]" : ""}`}/>
                })}{isNumLineClamped ? <div className="flex flex-wrap gap-0.5">{
                    Array.from(new Array(props.numLines - MAX_LINE_CLAMP).keys()).map(n => <div key={n} className="bg-white/80 block w-1 h-1 rounded-full"/>)
                }</div> : null}</>
        }
     </div>   
}

export const ExplorationVis = (props: {
    excludedUserIds: {[key:string]:boolean}
}) => {
    const prevExcludedUserIds = usePrevious(props.excludedUserIds)

    const token = useSelector(state => state.admin.auth.token)

    const [data, setData] = useState<{users: Array<IUserAllPopulated>, logs: Array<InteractionObj>} | null>(null)

    const onDownloadUsersJSON = useCallback(async ()=>{
        try{
            const resp = await Http.axios.get("/admin/data/all", {
                params: {exclude: Object.keys(props.excludedUserIds).filter(id => props.excludedUserIds[id] === true)},
                headers: Http.makeSignedInHeader(token!)})
            
            setData(resp.data)
        }catch(ex){
            console.log(ex)
        }
    }, [token, props.excludedUserIds])

    const onExportClick = useCallback(async () => {
        const svgDocument = elementToSVG(document.querySelector('#chart-exploration')!)

        // Inline external resources (fonts, images, etc) as data: URIs
        await inlineResources(svgDocument.documentElement)

        const svgString = new XMLSerializer().serializeToString(svgDocument)
        FileSaver.saveAs(new Blob([svgString], {type: 'application/svg'}), "exploration-chart.svg")
    }, [])


    useEffect(()=>{
        if(prevExcludedUserIds != props.excludedUserIds){
            //setUsers(null)
        }
    }, [prevExcludedUserIds, props.excludedUserIds])

    return <div>
        {
            data == null ? <Button onClick={onDownloadUsersJSON}>Refresh</Button> : <div>
                <div className="mb-5">
                    <Button onClick={onExportClick}>Export to SVG</Button>
                </div>
                <div id="chart-exploration" className={`flex flex-wrap gap-5`}>
                {
                    data.users.map(user => {
                        return <div key={user._id} className={'w-[4%] min-w-[80px]'}>
                            <div className="font-bold mb-2">{user.alias}</div>
                            {
                                user.initialNarrative != null ? <div className="bg-blue-400 p-1.5 rounded-md">
                                <TextPlaceholder numLines={numLines(user.initialNarrative)}/>
                            </div> : null
                            }
                            {
                                user.threads.map(thread=> {
                                    return <div key={thread._id} className="bg-slate-200 border border-gray-400 rounded-[5px] mt-2">
                                        <div className="bg-gray-500 block h-2 rounded-t-[3px]"/>
                                        <div className="p-1.5">
                                        {
                                            thread.questions.filter(question => question.selected === true).map(question => {

                                                const keywordToggleLogs: Array<InteractionObj> = []
                                                for(const interaction of data.logs){
                                                        if(interaction.type == InteractionType.UserToggleKeywords && (interaction.metadata as any)?.qid == question._id){
                                                            keywordToggleLogs.push(interaction as InteractionObj)
                                                        }
                                                    
                                                }
                                                let isKeywordOn = false
                                                if(keywordToggleLogs.length > 0){
                                                    keywordToggleLogs.sort((a,b) => moment(b.timestamp).unix() - moment(a.timestamp).unix())
                                                    isKeywordOn = (keywordToggleLogs[0].data as any)?.["flag"] == true
                                                }

                                                const guideCountArray = Array.from(new Array((question.aiGuides?.length || 1) - 1).keys())
                                                return <div key={question._id} className="bg-teal-400 p-1.5 rounded-md mt-1.5 first:mt-0">
                                                    <div className="flex flex-wrap gap-0.5 mb-2">
                                                        {isKeywordOn == true ? question.keywords.map((keywords, i) => {
                                                                return <div key={i} className="w-3 h-1.5 block rounded-full bg-rose-400"/>
                                                            }) : null
                                                        }
                                                    </div>
                                                    <div className="flex gap-x-2 items-start">
                                                        <TextPlaceholder numLines={numLines(question.response)} className="flex-1"/>
                                                        <div className="grid grid-flow-cols grid-cols-2 flex-wrap gap-0.5">{
                                                            guideCountArray.map((guide, i) => {
                                                                return <div key={i} className="w-2 h-2 block bg-black rounded-full"/>
                                                            })
                                                        }</div>
                                                    </div>
                                                </div>
                                            })
                                        }</div>
                                    </div>
                                })
                            }
                        </div>
                    })
                }
            </div></div>
        }
    </div>
}