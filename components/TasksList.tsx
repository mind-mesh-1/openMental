'use client';

import { AddTodo } from '@/components/AddTodo';
import { Task } from '@/components/Task';
import { useTasks } from '@/lib/hooks/use-tasks';
import { TaskStatus } from '@/lib/tasks.types';
import { AnimatePresence } from 'framer-motion';
import { ReactElement } from 'react';

interface IProp {
  className?: String;
}
const TasksList = (props: IProp): ReactElement => {
  const { className } = props;

  const { tasks } = useTasks();
  return (
    <main
      className={`flex h-screen flex-col items-center justify-between p-8 md:p-24 ${className}`}
    >
      <div className="flex flex-col gap-4 min-w-full md:min-w-[500px]">
        <h1 className="text-2xl font-bold">✍️ My Todos</h1>
        <AddTodo />

        <AnimatePresence>
          {tasks
            .sort((a, b) => {
              if (a.status === b.status) {
                return a.id - b.id;
              }
              return a.status === TaskStatus.todo ? -1 : 1;
            })
            .map((task) => (
              <Task key={task.id} task={task} />
            ))}
        </AnimatePresence>
      </div>
    </main>
  );
};

export default TasksList;
