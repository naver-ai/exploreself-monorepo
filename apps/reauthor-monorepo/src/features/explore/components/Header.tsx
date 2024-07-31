import { UserAvatar } from "./UserAvatar"

export const Header = () => {
    
    return <div className="bg-white shadow-sm shadow-slate-600/20 flex justify-between items-center w-full max-w-full z-10">
        <div className="ml-2 font-bold text-gray-600">MeSense</div>
        <UserAvatar buttonClassName="my-1 mr-1"/>
    </div>
}