import React, { useState } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import DragDropContainer from '../Components/Values/DragDropContainer';

const ValueSet: React.FC = () => {
  const initialItems = [
    { id: 1, value: 'Parenting' },
    { id: 2, value: 'Personal Growth' },
    { id: 3, value: 'Leisure' },
    { id: 4, value: 'Spirituality' },
    { id: 5, value: 'Health' },
    { id: 6, value: 'Work' },
    { id: 7, value: 'Community & Environment' },
    { id: 8, value: 'Family Relationships' },
    { id: 9, value: 'Intimate Relationships' },
    { id: 10, value: 'Social Relationships' },
  ];
  // TODO: 한국어 ACT의 가치카드로 변경


  return (
    <DndProvider backend={HTML5Backend}>
      <DragDropContainer initialItems={initialItems} />
    </DndProvider>
  );
};

export default ValueSet;
