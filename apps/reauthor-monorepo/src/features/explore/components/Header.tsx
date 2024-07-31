import { Button, Dropdown, MenuProps } from "antd"
import { useDispatch, useSelector } from "../../../redux/hooks"
import { useMemo } from "react"
import { signOut } from "../../auth/reducer"

export const Header = () => {
    const userName = useSelector(state => state.explore.name)

    console.log(userName)

    const dispatch = useDispatch()

    const menuData: MenuProps = useMemo(() => {
        return {
            items: [{
                key: 'logout',
                danger: true,
                label: "Sign Out"
            }],
            onClick: (ev) => {
                switch (ev.key) {
                    case "logout":
                        dispatch(signOut())
                        break;
                }
            }
        }
    }, [])
    
    return <div className="bg-white shadow-sm shadow-slate-600/20 flex justify-between items-center fixed w-full max-w-full">
        <div className="ml-2 font-bold text-gray-600">MeSense</div>
        <Dropdown menu={menuData}>
            <Button className="my-1 mr-1 rounded-full border-none">{userName}</Button>
        </Dropdown>
    </div>
}