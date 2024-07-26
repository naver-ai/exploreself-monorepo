import { BrowserRouter, Navigate, Outlet, Route, Routes } from "react-router-dom"
import Main from "../Pages/Main"
import InitialNarrative from "../Pages/InitialNarrative"
import ValueSet from "../Pages/ValueSet"
import Login from "../Pages/Login"
import { useVerifyToken } from "../features/auth/hooks"
import { useEffect } from "react"

const SignedInRoute = () => {
    const {verify, isSignedIn} = useVerifyToken()

    useEffect(()=>{
        verify().then(isSignedIn => {
            if(!isSignedIn){
                console.log("Should redirect to login")
            }
        })
    }, [verify])

    if(isSignedIn){
        return <Outlet/>
    }else if(isSignedIn == null){
        return <div>Verifying user...</div>
    }else{
        return <Navigate to="/app/login"/>
    }
}

export const MainRouter = () => {
    return (
        <BrowserRouter basename="/">
          <Routes>
            <Route index element={<Navigate to={"app"}/>}/>
            <Route path="app">
                <Route
                    path="login"
                    element={<Login/>}
                />
                <Route element={<SignedInRoute/>}>
                    <Route
                    index
                    element={<Main/>}
                    />
                    <Route
                    path="narrative"
                    element={<InitialNarrative/>}
                    />
                    <Route
                    path="value"
                    element={<ValueSet/>}
                    />
                </Route>
            </Route>            
          </Routes>
        </BrowserRouter>
      )
}