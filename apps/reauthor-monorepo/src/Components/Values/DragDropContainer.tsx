import React, { useCallback, useState } from 'react';
import { ItemType } from './valueType';
import DraggableItem from './DraggableItem';
import DropTargetBox from './DropTargetBox';
import update from 'immutability-helper'

interface DragDropContainerProps {
  initialItems: ItemType[];
}

const DragDropContainer: React.FC<DragDropContainerProps> = ({ initialItems }) => {
  const [items, setItems] = useState<ItemType[]>(initialItems);
  const [topBoxItems, setTopBoxItems] = useState<ItemType[]>([]);

  const handleDrop = (item: ItemType, index: number | null) => {
    const newTopBoxItems = [...topBoxItems];
    if (index === null) {
      newTopBoxItems.push(item);
    } else {
      newTopBoxItems.splice(index, 0, item);
    }
    setTopBoxItems(newTopBoxItems);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };


  const handleReorder = useCallback((dragIndex: number, hoverIndex: number) => {
    setTopBoxItems((prevCards: ItemType[]) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex] as ItemType],
        ],
      }),
    )
  }, []) 


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <DropTargetBox items={topBoxItems} onDrop={handleDrop} onReorder={handleReorder} />
      <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', width: '300px' }}>
        {items.map((item) => (
          <DraggableItem key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default DragDropContainer;
