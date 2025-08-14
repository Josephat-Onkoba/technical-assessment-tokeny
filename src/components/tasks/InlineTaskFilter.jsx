import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';

/**
 * InlineTaskFilter - a modal/dropdown version of TaskFilter for dashboard use
 * Props:
 *   - onFilter: (filteredTasks: array) => void
 *   - onClose: () => void
 */
const InlineTaskFilter = ({ onFilter, onClose }) => {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState({ status: 'all', search: '' });
  const [counts, setCounts] = useState({ all: 0, complete: 0, incomplete: 0 });
  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    const parsedTasks = storedTasks ? JSON.parse(storedTasks) : [];
    const normalized = parsedTasks.map((t) => {
      const title = t.title ?? t.name ?? 'Untitled';
      const description = t.description ?? '';
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
      return { ...t, _id: t._id || t.id || crypto.randomUUID(), title, description, status };
    });
    setTasks(normalized);
    updateCounts(normalized);
    applyFilters(normalized, filters);
    // eslint-disable-next-line
  }, []);

  const updateCounts = (taskList) => {
    setCounts({
      all: taskList.length,
      complete: taskList.filter((t) => t.status === 'complete').length,
      incomplete: taskList.filter((t) => t.status === 'incomplete').length,
    });
  };

  const applyFilters = useCallback((taskList, filterSettings) => {
    let result = [...taskList];
    if (filterSettings.status !== 'all') {
      result = result.filter((task) => task.status === filterSettings.status);
    }
    if (filterSettings.search.trim()) {
      const searchTerm = filterSettings.search.toLowerCase().trim();
      result = result.filter((task) => {
        const t = (task.title || '').toLowerCase();
        const d = (task.description || '').toLowerCase();
        return t.includes(searchTerm) || d.includes(searchTerm);
      });
    }
    setFilteredTasks(result);
    onFilter && onFilter(result);
  }, [onFilter]);

  useEffect(() => {
    applyFilters(tasks, filters);
    // eslint-disable-next-line
  }, [filters, tasks]);

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({ ...prev, [filterType]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md relative">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-red-500" onClick={onClose} aria-label="Close filter">
          <FaTimes size={20} />
        </button>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FaFilter /> Task Filter
        </h2>
        <div className="mb-4">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">Search Tasks</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
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
        <div className="mb-4">
          <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            id="status-filter"
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            aria-label="Filter tasks by status"
          >
            <option value="all">All Tasks ({counts.all})</option>
            <option value="complete">Complete ({counts.complete})</option>
            <option value="incomplete">Incomplete ({counts.incomplete})</option>
          </select>
        </div>
        <div className="mb-2 text-sm text-gray-500">Showing {filteredTasks.length} of {tasks.length} tasks</div>
      </div>
    </div>
  );
};

export default InlineTaskFilter;
