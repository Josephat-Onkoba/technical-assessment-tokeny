import React, { useEffect, useState, useRef } from "react";
import { FaFilter } from 'react-icons/fa';
import InlineTaskFilter from '../../components/tasks/InlineTaskFilter';
import { DndContext, closestCorners } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import UserSidebar from "./UserSidebar";
import Column from "./Column";
import SortableItem from "./SortableItem";
import notificationSound from "./notification.mp3";

const UserDashboard = () => {
  const [tasks, setTasks] = useState({
    "To Do": [],
    "In Progress": [],
    Completed: [],
  });
  const [allTasks, setAllTasks] = useState([]);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [notes, setNotes] = useState(localStorage.getItem("notes") || "");
  const audioRef = useRef(new Audio(notificationSound));

  // Ensure page starts from top when component loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Helper to categorize tasks for Kanban
  const categorize = (taskList) => ({
    "To Do": taskList.filter((task) => (task.progress ?? 0) <= 40),
    "In Progress": taskList.filter((task) => (task.progress ?? 0) > 40 && (task.progress ?? 0) <= 80),
    Completed: taskList.filter((task) => (task.progress ?? 0) > 80),
  });

  // Load initial tasks
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setAllTasks(storedTasks);
    setTasks(categorize(storedTasks));
    checkDeadlines(storedTasks);
  }, []);

  // Persist notes
  useEffect(() => {
    localStorage.setItem("notes", notes);
  }, [notes]);

  const checkDeadlines = (taskList) => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    taskList.forEach((task) => {
      if (task.deadline === today) {
        showNotification(`🚨 Task Due Today: "${task.title}"`, "bg-red-500 text-white");
      } else if (task.deadline === tomorrowStr) {
        showNotification(`⏳ Task Due Tomorrow: "${task.title}"`, "bg-yellow-500 text-black");
      }
    });
  };

  const showNotification = (message, bgClass) => {
    toast(
      <div className={`p-2 rounded-lg shadow-md font-semibold text-lg ${bgClass}`}>
        {message}
      </div>,
      { position: "top-right", autoClose: 5000, hideProgressBar: false }
    );
    audioRef.current.play();
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const sourceColumn = Object.keys(tasks).find((column) =>
      tasks[column].some((task) => task.id === active.id)
    );
    const targetColumn = Object.keys(tasks).find((column) => tasks[column].some((task) => task.id === over.id)) || over.id;

    if (!sourceColumn || !targetColumn || sourceColumn === targetColumn) return;

    setTasks((prevTasks) => {
      const updatedTasks = { ...prevTasks };
      const movedTask = updatedTasks[sourceColumn].find((task) => task.id === active.id);
      updatedTasks[sourceColumn] = updatedTasks[sourceColumn].filter((task) => task.id !== active.id);
      updatedTasks[targetColumn] = [...(updatedTasks[targetColumn] || []), movedTask];

      // Persist flat list
      const flat = [...updatedTasks["To Do"], ...updatedTasks["In Progress"], ...updatedTasks["Completed"]];
      localStorage.setItem("tasks", JSON.stringify(flat));
      setAllTasks(flat);
      return updatedTasks;
    });
  };

  const chartData = {
    labels: ["To Do", "In Progress", "Completed"],
    datasets: [
      {
        label: "Number of Tasks",
        data: [
          tasks["To Do"].length,
          tasks["In Progress"].length,
          tasks.Completed.length,
        ],
        backgroundColor: ["#FF6384", "#FFCE56", "#36A2EB"],
      },
    ],
  };

  // Handler for filter modal
  const handleFilter = (filtered) => {
    setTasks(categorize(filtered));
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-100 to-gray-100">
      <UserSidebar />

      <div className="flex-1 p-6">
        <div className="mx-auto w-full max-w-[1400px]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
              🚀 User Dashboard
            </h2>
            <button
              className="ml-4 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              onClick={() => setFilterModalOpen(true)}
              aria-label="Open task filter"
            >
              <FaFilter />
              <span className="hidden sm:inline">Filter Tasks</span>
            </button>
          </div>

          <ToastContainer position="top-right" autoClose={5000} hideProgressBar />

          {/* Kanban Board */}
          <div className="glassmorphism p-4 rounded-xl shadow-lg bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-lg border border-white/20">
            <DndContext collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.keys(tasks).map((columnKey) => (
                  <Column key={columnKey} title={columnKey} id={columnKey}>
                    <SortableContext items={tasks[columnKey].map((task) => task.id)} strategy={verticalListSortingStrategy}>
                      {tasks[columnKey].map((task) => (
                        <SortableItem key={task.id} id={task.id} task={task} />
                      ))}
                    </SortableContext>
                  </Column>
                ))}
              </div>
            </DndContext>
          </div>

          {/* Task Analytics & Notes Section */}
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Analytics Chart */}
            <div className="p-6 bg-white shadow-lg rounded-xl border border-gray-200">
              <h2 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-wide">
                📊 Task Analytics
              </h2>
              <Bar data={chartData} />
            </div>

            {/* Notes */}
            <div className="p-6 bg-green-900 text-white rounded-xl border-[12px] border-[#8B4501] shadow-lg flex flex-col min-h-[380px]">
              <h2 className="text-2xl font-bold text-yellow-400 mb-2">📌 Notes</h2>
              <textarea
                className="flex-1 bg-transparent border-none outline-none text-white text-lg p-4"
                placeholder="Write your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                style={{
                  fontFamily: "Chalkduster, Comic Sans MS, cursive",
                  minHeight: "300px",
                  resize: "none",
                }}
              />
            </div>
          </div>

          {filterModalOpen && (
            <InlineTaskFilter
              onFilter={handleFilter}
              onClose={() => {
                setFilterModalOpen(false);
                setTasks(categorize(allTasks));
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
