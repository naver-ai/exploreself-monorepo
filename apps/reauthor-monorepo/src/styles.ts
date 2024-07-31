import { ThemeConfig } from "antd";

export const theme: ThemeConfig = {
    token: {
        colorPrimary: "#ef5594",
        fontSize: 14,
        fontFamily: "'NanumSquareNeo', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol','Noto Color Emoji'"
    },
    components: {
        Layout: {
            colorBgLayout: 'transparent',
            siderBg: 'white'      
        },
        Divider: {
            orientationMargin: 0,
            textPaddingInline: 0
        },
    }
}