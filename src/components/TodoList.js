import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const TodoList = () => {
  const [todoLists, setTodoLists] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [taskInputs, setTaskInputs] = useState({});
  const [draggedTask, setDraggedTask] = useState(null);

  const auth = getAuth();
  const navigate = useNavigate();

  const fetchTodoLists = async (user) => {
    if (user) {
      try {
        const querySnapshot = await getDocs(
          collection(db, `users/${user.uid}/todoLists`)
        );
        const fetchedLists = await Promise.all(
          querySnapshot.docs.map(async (listDoc) => {
            const tasksSnapshot = await getDocs(
              collection(db, `users/${user.uid}/todoLists/${listDoc.id}/tasks`)
            );
            const tasks = tasksSnapshot.docs.map((taskDoc) => ({
              id: taskDoc.id,
              ...taskDoc.data(),
            }));
            return {
              id: listDoc.id,
              ...listDoc.data(),
              tasks,
            };
          })
        );
        setTodoLists(fetchedLists);
      } catch (error) {
        console.error("Error fetching To-Do Lists: ", error);
      }
    }
  };

  const addTodoList = async () => {
    const user = getAuth().currentUser;
    if (newListName.trim() && user) {
      try {
        await addDoc(collection(db, `users/${user.uid}/todoLists`), {
          name: newListName,
          createdBy: user.email,
          createdAt: new Date(),
        });
        fetchTodoLists(user);
        setNewListName("");
      } catch (error) {
        console.error("Error adding To-Do List: ", error);
      }
    }
  };

  const handleTaskInputChange = (listId, field, value) => {
    setTaskInputs((prev) => ({
      ...prev,
      [listId]: { ...prev[listId], [field]: value },
    }));
  };

  const addTask = async (listId) => {
    const user = getAuth().currentUser;
    const newTask = taskInputs[listId];
    if (newTask?.title.trim() && user) {
      try {
        await addDoc(
          collection(db, `users/${user.uid}/todoLists/${listId}/tasks`),
          {
            ...newTask,
            priority: newTask.priority || "low",
            createdAt: new Date(),
          }
        );
        fetchTodoLists(user);
        setTaskInputs((prev) => ({
          ...prev,
          [listId]: {
            title: "",
            description: "",
            dueDate: "",
            priority: "low",
          },
        }));
      } catch (error) {
        console.error("Error adding task: ", error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

  // Handling drag start
  const handleDragStart = (task, listId) => {
    setDraggedTask({ ...task, listId });
  };

  // Handling drop event
  const handleDrop = async (listId, priority) => {
    if (draggedTask && draggedTask.listId === listId && draggedTask.priority !== priority) {
      try {
        // Update task's priority in Firestore
        const user = getAuth().currentUser;
        await updateDoc(doc(db, `users/${user.uid}/todoLists/${listId}/tasks`, draggedTask.id), {
          ...draggedTask,
          priority,
        });

        // Refresh lists
        fetchTodoLists(user);
      } catch (error) {
        console.error("Error moving task: ", error);
      } finally {
        setDraggedTask(null);
      }
    }
  };

  // Prevent default dragover behavior
  const handleDragOver = (event) => {
    event.preventDefault();
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchTodoLists(user);
      } else {
        setTodoLists([]);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  return (
    <div
  className="min-h-screen bg-gradient-to-r from-gray-800 to-gray-600 flex flex-col items-center justify-center p-6"
  onDragOver={handleDragOver}
>

      <div className="max-w-4xl w-full bg-gray-800 shadow-lg rounded-lg p-8 flex flex-col justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white text-center mb-6">
            To-Do App
          </h2>
  
          <div className="mb-4 flex justify-between">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              className="flex-1 p-2 border rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Create new To-Do List"
            />
            <button
  onClick={addTodoList}
  className="ml-4 bg-gray-700 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-600 transition"
>
  Add List
</button>

          </div>
  
          <div className="grid lg:grid-cols-2 gap-6">
            {todoLists.map((list) => (
              <div key={list.id} className="p-6 bg-gray-700 rounded-lg shadow-md">
                <h3 className="text-xl font-bold text-yellow-400">{list.name}</h3>
  
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <input
                    type="text"
                    value={taskInputs[list.id]?.title || ""}
                    onChange={(e) =>
                      handleTaskInputChange(list.id, "title", e.target.value)
                    }
                    className="p-2 border rounded-md text-black"
                    placeholder="Task Title"
                  />
                  <input
                    type="text"
                    value={taskInputs[list.id]?.description || ""}
                    onChange={(e) =>
                      handleTaskInputChange(
                        list.id,
                        "description",
                        e.target.value
                      )
                    }
                    className="p-2 border rounded-md text-black"
                    placeholder="Task Description"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <input
                    type="date"
                    value={taskInputs[list.id]?.dueDate || ""}
                    onChange={(e) =>
                      handleTaskInputChange(list.id, "dueDate", e.target.value)
                    }
                    className="p-2 border rounded-md text-black"

                  />
                  <select
                    value={taskInputs[list.id]?.priority || "low"}
                    onChange={(e) =>
                      handleTaskInputChange(list.id, "priority", e.target.value)
                    }
                    className="p-2 border rounded-md text-black"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
  
                <button
  onClick={() => addTask(list.id)}
  className="bg-gray-800 text-white px-4 py-2 rounded-md shadow-md hover:bg-gray-700 transition"
>
  Add Task
</button>


  
                {["low", "medium", "high"].map((priority) => (
                  <div
                    key={priority}
                    className={`p-4 rounded-lg shadow-md mt-4 ${
                      priority === "high"
                        ? "bg-red-600"
                        : priority === "medium"
                        ? "bg-yellow-600"
                        : "bg-green-600"
                    }`}
                    onDrop={() => handleDrop(list.id, priority)}
                    onDragOver={handleDragOver}
                  >
                    <h4 className="font-semibold capitalize text-white">
                      {priority} Priority
                    </h4>
                    {list.tasks
                      .filter((task) => task.priority === priority)
                      .map((task) => (
                        <div
                          key={task.id}
                          className="bg-gray-800 p-3 mt-2 rounded-lg shadow-md flex justify-between items-center"
                          draggable
                          onDragStart={() => handleDragStart(task, list.id)}
                        >
                          <div>
                            <h5 className="font-bold text-gray-200">{task.title}</h5>
                            <p className="text-sm text-gray-400">
                              {task.description}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500">{task.dueDate}</p>
                        </div>
                      ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
  
        <div className="flex justify-center mt-8">
          <button
            onClick={handleLogout}
            className="bg-gray-700 text-white px-6 py-2 rounded-md shadow-md hover:bg-gray-600 transition"
            style={{ alignSelf: "flex-end" }} // Ensure the button is at the bottom
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
export default TodoList;
