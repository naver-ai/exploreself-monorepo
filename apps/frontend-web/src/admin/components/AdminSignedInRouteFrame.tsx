import { useCallback, useEffect } from 'react';
import { Outlet, useMatch, useNavigate } from 'react-router-dom';
import { useSelector } from '../../redux/hooks';
import { socket } from '../../services/socket';
import { Layout, Menu, MenuProps } from 'antd';
import { CircleStackIcon, UsersIcon } from '@heroicons/react/20/solid';

type MenuItem = Required<MenuProps>['items'][number];

const NavItems: Array<MenuItem> = [{
    key: "users",
    icon: <UsersIcon className="w-4 h-4"/>,
    label: "Users"
}, {
    key: "data",
    icon: <CircleStackIcon className="w-4 h-4"/>,
    label: "Data"
}]

export const AdminSignedInRouteFrame = () => {

    const token = useSelector(state=> state.admin.auth.token)

    const urlMatch = useMatch('/admin/:route/:route2?')

    const nav = useNavigate()
    
    const onNavClick = useCallback((args: {key: string})=>{
        nav("/admin/" + args.key)
    }, [nav, urlMatch?.params.route])

    useEffect(()=>{
        socket.auth = {
            token,
            mode: 'admin'
        }

        socket.on('connect', ()=>{

            console.log("Admin connected to websocket.")
        })

        socket.connect()

        return () => {
            socket.disconnect()
        }
    }, [token])

    return <Layout className='h-lvh'>
            <Layout.Sider className='h-lvh overflow-y-scroll'>
                <Menu items={NavItems}
                    selectedKeys={urlMatch != null ? [urlMatch.params.route!] : undefined}
                    onClick={onNavClick}
                />
            </Layout.Sider>
            <Layout.Content className='h-lvh overflow-y-scroll'>
                <Outlet/>
            </Layout.Content>
        </Layout>
}

export default AdminSignedInRouteFrame