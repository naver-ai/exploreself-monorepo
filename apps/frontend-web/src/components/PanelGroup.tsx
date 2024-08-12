import { Popover } from "antd";
import {InfoCircleOutlined} from '@ant-design/icons'
import colors from "tailwindcss/colors";
import { InfoPopover } from "./InfoPopover";

export const PanelGroup = (props: {
  title: string;
  iconComponent?: React.ComponentClass | any;
  titleContainerClassName?: string;
  children?: any;
  info?: string;
}) => {
  return (
    <div className="p-3">
      <div
        className={`font-bold text-sm flex items-center justify-between mb-2 select-none ${props.titleContainerClassName}`}
      >
        <div className="flex items-center gap-1">
          {props.iconComponent != null ? (
            <props.iconComponent className="w-4 h-4" />
          ) : null}
          <span>{props.title}</span>
        </div>
        {props.info && <InfoPopover content={props.info} title={props.title}/>}
      </div>
      {props.children}
    </div>
  );
};
