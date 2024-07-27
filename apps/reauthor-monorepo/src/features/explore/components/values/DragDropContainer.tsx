import React, { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DraggableItem from './DraggableItem';
import DropTargetBox from './DropTargetBox';
import update from 'immutability-helper'
import { useDispatch } from '../../../../Redux/hooks';
import { ValueItemType } from 'apps/reauthor-monorepo/src/Config/interface';

interface DragDropContainerProps {
  initialItems: ValueItemType[];
}

const DragDropContainer: React.FC<DragDropContainerProps> = ({ initialItems }) => {
  const [items, setItems] = useState<ValueItemType[]>(initialItems);
  const [topBoxItems, setTopBoxItems] = useState<ValueItemType[]>([]);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleDrop = (item: ValueItemType, index: number | null) => {
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
    setTopBoxItems((prevCards: ValueItemType[]) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex] as ValueItemType],
        ],
      }),
    )
  }, []) 

  const setValues = () => {
    console.log("Set values")
    //dispatch(setValueSet(topBoxItems.map(item => item.value)))
    debugger;
  }

  const onSubmit = () => {
    console.log("ITEMS: ", topBoxItems)
    setValues();
    navigate('/')
    // TODO: Update to database instead of redux
  }


  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <DropTargetBox items={topBoxItems} onDrop={handleDrop} onReorder={handleReorder} />
      <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', width: '300px' }}>
        {items.map((item) => (
          <DraggableItem key={item.id} item={item} />
        ))}
      </div>
      <button onClick={onSubmit}>Next</button>
    </div>
  );
};

export default DragDropContainer;
