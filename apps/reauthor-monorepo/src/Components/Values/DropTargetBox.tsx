import React, { useCallback } from 'react';
import { useDrop, useDrag } from 'react-dnd';
import { ItemType } from './valueType';

interface DraggableBoxProps {
  item: ItemType;
  index: number;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
  onDrop: (item: ItemType, index: number | null) => void;
}

const DraggableBox: React.FC<DraggableBoxProps> = ({ item, index, onReorder, onDrop }) => {
  const [, ref, preview] = useDrag({
    type: 'ITEM',
    item: { ...item, index },
  });

  const [, drop] = useDrop({
    accept: 'ITEM',
    // hover: (draggedItem: ItemType & { index: number }) => {
    //   if (draggedItem.index !== index) {
    //     onReorder(draggedItem.index, index);
    //     draggedItem.index = index;
    //   }
    // },
    // TODO: Reorder by hovering
    drop: (draggedItem: ItemType & { index: number }) => {
      if (draggedItem.index === undefined) {
        onDrop(draggedItem, index);
      }
    }, 
  });

  return (
    <div ref={(node) => ref(drop(node))} style={{ padding: '8px', margin: '4px', backgroundColor: 'lightgreen', cursor: 'move' }}>
      {item.value}
    </div>
  );
};

interface DropTargetBoxProps {
  items: ItemType[];
  onDrop: (item: ItemType, index: number | null) => void;
  onReorder: (dragIndex: number, hoverIndex: number) => void;
}

const DropTargetBox: React.FC<DropTargetBoxProps> = ({ items, onDrop, onReorder}) => {
  const [, drop] = useDrop({
    accept: 'ITEM',
    drop: (item: ItemType) => onDrop(item, null),
  });

  const renderItem = useCallback(
    (item: ItemType, index: number) => {
      return (
        <DraggableBox key={item.id} item={item} index={index} onReorder={onReorder} onDrop={onDrop}/>
      )
    },[]
  )

  return (
    <div ref={drop} style={{ minHeight: '100px', minWidth: '200px', backgroundColor: 'lightgray', padding: '10px' }}>
      {items.map((item, index) => (
        renderItem(item, index)
      ))}
    </div>
  );
};

export default DropTargetBox;
