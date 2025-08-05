import { Task, Status } from '../types';

export const status: Status[] = [
  { id: 'todo', title: 'To Do', order: 'a' },
  { id: 'in-progress', title: 'In Progress', order: 'b' },
  { id: 'done', title: 'Done', order: 'c' },
];

export const tasks: Task[] = [
  {
    id: '1',
    statusId: 'todo',
    content: 'Task 1',
    order: 'a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: '2',
    statusId: 'todo',
    content: 'Task 2',
    order: 'b',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: '3',
    statusId: 'in-progress',
    content: 'Task 3',
    order: 'a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
  {
    id: '4',
    statusId: 'done',
    content: 'Task 4',
    order: 'a',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    archived: false,
  },
];