export const PanelGroup = (props: {
  title: string;
  iconComponent?: React.ComponentClass | any;
  titleContainerClassName?: string;
  children?: any;
}) => {
  return (
    <div className="p-3">
      <div
        className={`font-bold text-sm flex items-center gap-1 mb-2 select-none ${props.titleContainerClassName}`}
      >
        {props.iconComponent != null ? (
          <props.iconComponent className="w-4 h-4" />
        ) : null}
        <span>{props.title}</span>
      </div>
      {props.children}
    </div>
  );
};
