import React from 'react';
import { useDrag } from 'react-dnd';
import { ItemType } from '../../../../Components/Values/valueType';

interface DraggableItemProps {
  item: ItemType;
}

const DraggableItem: React.FC<DraggableItemProps> = ({ item }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ITEM',
    item,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      style={{
        opacity: isDragging ? 0.5 : 1,
        padding: '8px',
        margin: '4px',
        backgroundColor: 'lightblue',
        cursor: 'move',
      }}
    >
      {item.value}
    </div>
  );
};

export default DraggableItem;
