"use client";
import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useKanban } from "@/hooks/useKanban";
import { v4 as uuidv4 } from "uuid";
import { FaPlus, FaTrash } from "react-icons/fa";

export default function KanbanPage() {
  const { data, saveBoard, loading } = useKanban();
  const [isBrowser, setIsBrowser] = useState(false); // Fix for Next.js hydration

  useEffect(() => setIsBrowser(true), []);

  if (loading || !isBrowser) return <div className="p-10 text-white">Loading Board...</div>;

  // --- LOGIC: Handle Drag End ---
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const startCol = data.columns[source.droppableId];
    const finishCol = data.columns[destination.droppableId];

    // 1. Moving within the same list
    if (startCol === finishCol) {
      const newTaskIds = Array.from(startCol.taskIds);
      newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, draggableId);

      const newCol = { ...startCol, taskIds: newTaskIds };
      const newState = {
        ...data,
        columns: { ...data.columns, [newCol.id]: newCol },
      };
      saveBoard(newState);
      return;
    }

    // 2. Moving from one list to another
    const startTaskIds = Array.from(startCol.taskIds);
    startTaskIds.splice(source.index, 1);
    const newStart = { ...startCol, taskIds: startTaskIds };

    const finishTaskIds = Array.from(finishCol.taskIds);
    finishTaskIds.splice(destination.index, 0, draggableId);
    const newFinish = { ...finishCol, taskIds: finishTaskIds };

    const newState = {
      ...data,
      columns: {
        ...data.columns,
        [newStart.id]: newStart,
        [newFinish.id]: newFinish,
      },
    };
    saveBoard(newState);
  };

  // --- LOGIC: Add Task ---
  const addNewTask = (columnId) => {
    const text = prompt("What needs to be done?");
    if (!text) return;

    const newTaskId = uuidv4();
    const newTask = { id: newTaskId, content: text };

    const newState = {
      ...data,
      tasks: { ...data.tasks, [newTaskId]: newTask },
      columns: {
        ...data.columns,
        [columnId]: {
          ...data.columns[columnId],
          taskIds: [...data.columns[columnId].taskIds, newTaskId],
        },
      },
    };
    saveBoard(newState);
  };

  // --- LOGIC: Delete Task ---
  const deleteTask = (taskId, columnId) => {
    const newColumnTaskIds = data.columns[columnId].taskIds.filter(id => id !== taskId);
    const newTasks = { ...data.tasks };
    delete newTasks[taskId];

    const newState = {
      ...data,
      tasks: newTasks,
      columns: {
        ...data.columns,
        [columnId]: { ...data.columns[columnId], taskIds: newColumnTaskIds },
      },
    };
    saveBoard(newState);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 overflow-x-auto">
      <h1 className="text-3xl font-bold mb-8">Mission Control</h1>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex gap-6 min-w-full md:min-w-0">
          {data.columnOrder.map((columnId) => {
            const column = data.columns[columnId];
            const tasks = column.taskIds.map((taskId) => data.tasks[taskId]);

            return (
              <div key={column.id} className="bg-slate-800/50 border border-slate-700 w-80 min-w-[320px] rounded-xl flex flex-col h-[70vh]">
                {/* Column Header */}
                <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800 rounded-t-xl">
                  <h3 className="font-bold text-lg">{column.title}</h3>
                  <span className="bg-slate-700 px-2 rounded text-sm text-slate-300">{tasks.length}</span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={`flex-1 p-3 overflow-y-auto transition-colors ${
                        snapshot.isDraggingOver ? "bg-slate-700/30" : ""
                      }`}
                    >
                      {tasks.map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`p-4 mb-3 rounded-lg border shadow-sm group relative transition-all ${
                                snapshot.isDragging 
                                  ? "bg-cyan-900/80 border-cyan-500 scale-105 z-50" 
                                  : "bg-slate-700/40 border-slate-600 hover:bg-slate-700"
                              }`}
                            >
                              <p className="text-sm">{task.content}</p>
                              
                              {/* Delete Button (visible on hover) */}
                              <button 
                                onClick={() => deleteTask(task.id, column.id)}
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-opacity"
                              >
                                <FaTrash size={12} />
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>

                {/* Add Button Footer */}
                <div className="p-3 border-t border-slate-700">
                  <button 
                    onClick={() => addNewTask(column.id)}
                    className="w-full py-2 flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded transition-all"
                  >
                    <FaPlus size={12} /> Add Task
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}