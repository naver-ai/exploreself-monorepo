import { Button, Card, Checkbox, Divider } from "antd"
import { useDispatch, useSelector } from "../../../../redux/hooks"
import { useCallback, useEffect, useMemo, useState } from "react"
import { loadUsers, usersSelectors } from "../../users/reducer"
import { LoadingIndicator } from "../../../../components/LoadingIndicator"
import { CheckboxChangeEvent } from "antd/es/checkbox"
import { Http } from "../../../../net/http"
import * as FileSaver from 'file-saver'
import { ExplorationVis } from "../components/ExplorationVis"


export const DataPage = () => {

    const dispatch = useDispatch()

    const isLoadingUsers = useSelector(state => state.admin.users.isLoadingUserList)

    const token = useSelector(state => state.admin.auth.token)

    const users = useSelector(usersSelectors.selectAll)

    const [excludedUserIds, setExcludedUserIds] = useState<{[key:string]: boolean}>({})

    const onCheckboxChange = useCallback((ev: CheckboxChangeEvent)=>{
        const userId = ev.target.id
        if(userId != null){
            console.log(userId, !ev.target.checked)
            setExcludedUserIds({...excludedUserIds, [userId]: !ev.target.checked})
        }
    }, [excludedUserIds])

    const onDownloadUsersJSON = useCallback(async ()=>{
        try{
            const resp = await Http.axios.get("/admin/data/all", {
                params: {exclude: Object.keys(excludedUserIds).filter(id => excludedUserIds[id] === true)},
                headers: Http.makeSignedInHeader(token!)})
            FileSaver.saveAs(new Blob([JSON.stringify(resp.data, null, 2)], {type: 'application/json'}), 'reauthor-users-all-data.json')
        }catch(ex){
            console.log(ex)
        }
    }, [token])

    useEffect(() => {
        dispatch(loadUsers())
    }, [])

    return <div className="container mx-auto px-10 py-10">
        {
            isLoadingUsers === true ? <LoadingIndicator title="Loading users..." /> : <>
                <Card size="small" className="mb-12" bordered={false} title="Included Users">
                    <div className="flex flex-wrap">
                        {
                            users.map(user => <Checkbox defaultChecked={excludedUserIds[user._id] !== false} id={user._id} onChange={onCheckboxChange} key={user._id}>{user.alias}</Checkbox>)
                        }
                    </div>
                </Card>
                <Divider orientation="left">Dataset</Divider>
                <div className="flex flex-wrap gap-3">
                    <Button onClick={onDownloadUsersJSON}>Download Populated Users JSON</Button>
                </div>
                
                <Divider orientation="left">Visualization</Divider>
                <ExplorationVis excludedUserIds={excludedUserIds}/>
            </>
        }
    </div>
}