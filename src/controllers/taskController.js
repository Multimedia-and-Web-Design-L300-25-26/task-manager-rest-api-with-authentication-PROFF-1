import Task from "../models/Task.js";
import {
  createTaskInMemory,
  deleteTaskByIdInMemory,
  findTaskByIdInMemory,
  findTasksByOwnerInMemory
} from "../store/memoryStore.js";

const useInMemoryStore = process.env.NODE_ENV === "test" || process.env.USE_IN_MEMORY_DB === "true";

export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    const task = useInMemoryStore
      ? createTaskInMemory({ title, description, owner: req.user._id.toString() })
      : await Task.create({
        title,
        description,
        owner: req.user._id
      });

    return res.status(201).json(task);
  } catch (error) {
    return res.status(500).json({ message: "Failed to create task" });
  }
};

export const getTasks = async (req, res) => {
  try {
    const tasks = useInMemoryStore
      ? findTasksByOwnerInMemory(req.user._id.toString())
      : await Task.find({ owner: req.user._id }).sort({ createdAt: -1 });

    return res.status(200).json(tasks);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch tasks" });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = useInMemoryStore
      ? findTaskByIdInMemory(req.params.id)
      : await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (task.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (useInMemoryStore) {
      deleteTaskByIdInMemory(req.params.id);
    } else {
      await task.deleteOne();
    }

    return res.status(200).json({ message: "Task deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete task" });
  }
};
