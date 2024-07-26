import { Outlet } from "react-router-dom"
import { Header } from "./Header"

export const SignedInScreenFrame = () => {
    return <div><Header/><Outlet/></div>
}