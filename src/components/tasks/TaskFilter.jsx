/**
 * TaskFilter Component
 * 
 * A comprehensive task filtering component that allows users to filter tasks
 * by completion status and search by title. Implements real-time filtering
 * with localStorage integration for persistent data access.
 * 
 * Features:
 * - Filter tasks by completion status (All/Complete/Incomplete)
 * - Search tasks by title with real-time results
 * - Responsive design with mobile optimization
 * - Accessibility support with ARIA attributes
 * - Integration with localStorage for data persistence
 * 
 * @author Senior Full-Stack Engineer
 * @version 1.0.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaSpinner, FaExclamationTriangle, FaTasks } from 'react-icons/fa';

const TaskFilter = () => {
  // State management with proper initialization
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  });
  const [counts, setCounts] = useState({
    all: 0,
    complete: 0,
    incomplete: 0
  });

  /**
   * Load tasks from localStorage and normalize shapes
   * Supports: {status:'complete'|'incomplete'} OR {completed:boolean} OR {progress:number}
   */
  useEffect(() => {
    const loadTasks = async () => {
      try {
        // Simulate network delay for realistic UX
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Get tasks from localStorage
        const storedTasks = localStorage.getItem('tasks');
        
        if (storedTasks) {
          const parsedTasks = JSON.parse(storedTasks);
          // Normalize tasks to ensure status/title/description are present
          const normalized = (Array.isArray(parsedTasks) ? parsedTasks : []).map((t) => {
            const title = t.title ?? t.name ?? "Untitled";
            const description = t.description ?? "";
            let status = t.status;
            if (!status) {
              if (typeof t.completed === 'boolean') {
                status = t.completed ? 'complete' : 'incomplete';
              } else if (typeof t.progress === 'number') {
                status = t.progress >= 100 ? 'complete' : 'incomplete';
              } else {
                status = 'incomplete';
              }
            }
            return {
              ...t,
              _id: t._id || t.id || crypto.randomUUID(),
              title,
              description,
              status,
            };
          });
          setTasks(normalized);
          
          // Apply initial filtering
          applyFilters(normalized, filters);
          
          // Calculate counts
          updateCounts(normalized);
        } else {
          // Initialize with empty array if no tasks exist
          setTasks([]);
          setFilteredTasks([]);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error loading tasks:', err);
        setError('Failed to load tasks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
    
    // Set up event listener for storage changes from other components
    const handleStorageChange = (e) => {
      if (e.key === 'tasks') {
        try {
          const updatedTasks = JSON.parse(e.newValue || '[]');
          setTasks(updatedTasks);
          applyFilters(updatedTasks, filters);
          updateCounts(updatedTasks);
        } catch (err) {
          console.error('Error parsing tasks from storage:', err);
        }
      }
    };
    
    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  /**
   * Update task counts by status
   * 
   * @param {Array} taskList - List of tasks to count
   */
  const updateCounts = (taskList) => {
    const completeTasks = taskList.filter(task => task.status === 'complete').length;
    const incompleteTasks = taskList.filter(task => task.status === 'incomplete').length;
    
    setCounts({
      all: taskList.length,
      complete: completeTasks,
      incomplete: incompleteTasks
    });
  };

  /**
   * Apply filters to tasks based on current filter settings
   * Memoized with useCallback to prevent unnecessary re-renders
   * 
   * @param {Array} taskList - List of tasks to filter
   * @param {Object} filterSettings - Current filter settings
   */
  const applyFilters = useCallback((taskList, filterSettings) => {
    let result = [...taskList];
    
    // Apply status filter
    if (filterSettings.status !== 'all') {
      result = result.filter(task => task.status === filterSettings.status);
    }
    
    // Apply search filter
    if (filterSettings.search.trim()) {
      const searchTerm = filterSettings.search.toLowerCase().trim();
      result = result.filter(task => {
        const t = (task.title || '').toLowerCase();
        const d = (task.description || '').toLowerCase();
        return t.includes(searchTerm) || d.includes(searchTerm);
      });
    }
    
    setFilteredTasks(result);
  }, []);

  /**
   * Handle filter changes
   * 
   * @param {string} filterType - Type of filter to change
   * @param {string} value - New filter value
   */
  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    
    setFilters(newFilters);
    applyFilters(tasks, newFilters);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center" aria-live="polite" role="status">
        <FaSpinner className="animate-spin text-blue-500 text-2xl" aria-hidden="true" />
        <span className="ml-2">Loading tasks...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 text-red-500 flex items-center" aria-live="assertive" role="alert">
        <FaExclamationTriangle className="mr-2" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center">
        <FaTasks className="mr-2" aria-hidden="true" />
        Task Filter
      </h2>
      
      <div className="mb-6 space-y-4">
        {/* Search input */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
            Search Tasks
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" aria-hidden="true" />
            </div>
            <input
              id="search"
              type="text"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Search by title or description"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              aria-label="Search tasks"
            />
          </div>
        </div>
        
        {/* Status filter */}
        <div>
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Filter by Status
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaFilter className="text-gray-400" aria-hidden="true" />
            </div>
            <select
              id="status-filter"
              className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              aria-label="Filter tasks by status"
            >
              <option value="all">All Tasks ({counts.all})</option>
              <option value="complete">Complete ({counts.complete})</option>
              <option value="incomplete">Incomplete ({counts.incomplete})</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Results count */}
      <div className="mb-4 text-sm text-gray-500">
        Showing {filteredTasks.length} of {tasks.length} tasks
      </div>
      
      {/* Task list */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No tasks match your filters</p>
          <button
            className="mt-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800"
            onClick={() => {
              const resetFilters = { status: 'all', search: '' };
              setFilters(resetFilters);
              applyFilters(tasks, resetFilters);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-gray-200">
          {filteredTasks.map((task) => (
            <li key={task._id} className="py-4">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className={`text-lg font-medium ${task.status === 'complete' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                    {task.title}
                  </h3>
                  <p className={`mt-1 text-sm ${task.status === 'complete' ? 'text-gray-400' : 'text-gray-600'}`}>
                    {task.description}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span 
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'complete' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {task.status === 'complete' ? 'Complete' : 'Incomplete'}
                    </span>
                    
                    {task.priority && (
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.priority === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {task.priority}
                      </span>
                    )}
                  </div>
                </div>
                
                {task.dueDate && (
                  <div className="ml-4 flex-shrink-0 text-sm text-gray-500">
                    Due: {new Date(task.dueDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TaskFilter;

