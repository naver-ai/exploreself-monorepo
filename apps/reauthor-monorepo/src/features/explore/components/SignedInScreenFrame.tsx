import { Outlet } from "react-router-dom"
import { Header } from "./Header"
import { useDispatch, useSelector } from "../../../redux/hooks"
import { useEffect } from "react"
import { fetchUserInfo } from "../reducer"
import { Spin } from "antd"

export const SignedInScreenFrame = () => {

    const dispatch = useDispatch()

    const isLoadingUserInfo = useSelector(state => state.explore.isLoadingUserInfo)

    useEffect(() => {
        dispatch(fetchUserInfo());
    }, [])

    return <div><Header />{isLoadingUserInfo == true ? <div className="p-10"><Spin tip="Loading..."><div /></Spin></div> : <Outlet />}</div>
}