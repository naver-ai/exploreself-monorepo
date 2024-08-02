import { Spin } from "antd"

export const LoadingIndicator = (props: {
    title: string,
    className?: string
}) => {
    return <div className={`flex items-center gap-x-3 justify-center py-3 ${props.className}`}><Spin/><span className='animate-pulse text-teal-700 font-semibold'>{props.title}</span></div>
}