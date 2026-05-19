import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { QuestionEditor } from './QuestionEditor';
import type { Question } from '../types';

interface SortableQuestionEditorProps {
  question: Question;
  index: number;
}

export const SortableQuestionEditor: React.FC<SortableQuestionEditorProps> = ({ question, index }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 999 : 'auto',
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <QuestionEditor question={question} index={index} />
    </div>
  );
};
