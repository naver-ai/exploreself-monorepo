import { Popover } from "antd"
import {InfoCircleOutlined} from '@ant-design/icons'

interface InfoPopoverProps {
  title?: string;
  iconColor?: string;
  content: string;
}

export const InfoPopover = ({
  title,
  iconColor = 'gray-400',
  content
}: InfoPopoverProps) => {
  return (
    <Popover content={content} title={title} trigger ="hover">
      <InfoCircleOutlined className={`text-${iconColor}`} />
    </Popover>
  );
};