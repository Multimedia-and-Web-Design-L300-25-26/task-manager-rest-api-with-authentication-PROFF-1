import mongoose from "mongoose";

const users = [];
const tasks = [];

const createId = () => new mongoose.Types.ObjectId().toString();

export const clearMemoryStore = () => {
  users.length = 0;
  tasks.length = 0;
};

export const createUserInMemory = ({ name, email, password }) => {
  const user = {
    _id: createId(),
    name,
    email,
    password,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  users.push(user);
  return user;
};

export const findUserByEmailInMemory = (email) => {
  return users.find((user) => user.email === email) || null;
};

export const findUserByIdInMemory = (id) => {
  return users.find((user) => user._id.toString() === id.toString()) || null;
};

export const createTaskInMemory = ({ title, description = "", owner }) => {
  const task = {
    _id: createId(),
    title,
    description,
    completed: false,
    owner,
    createdAt: new Date(),
    updatedAt: new Date()
  };

  tasks.push(task);
  return task;
};

export const findTasksByOwnerInMemory = (ownerId) => {
  return tasks.filter((task) => task.owner.toString() === ownerId.toString());
};

export const findTaskByIdInMemory = (id) => {
  return tasks.find((task) => task._id.toString() === id.toString()) || null;
};

export const deleteTaskByIdInMemory = (id) => {
  const taskIndex = tasks.findIndex((task) => task._id.toString() === id.toString());
  if (taskIndex === -1) {
    return null;
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);
  return deletedTask;
};
