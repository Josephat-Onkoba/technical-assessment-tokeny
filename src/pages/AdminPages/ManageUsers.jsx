// import React, { useState } from "react";
// import Sidebar from "../../components/admin/Sidebar";
// import { useEffect } from "react";
// //import { useState } from "react";
// const ManageUsers = () => {
//   // Dummy user data
//   // const [users, setUsers] = useState([
//   //   { id: 1, name: "John Doe", email: "john@example.com", role: "Admin" },
//   //   { id: 2, name: "Jane Smith", email: "jane@example.com", role: "User" },
//   //   { id: 3, name: "Mike Johnson", email: "mike@example.com", role: "User" },
//   // ]);
//   // const [users, setUsers] = useState([]);
//   const [user, setUsers] = useState([]);
//   useEffect(() => {
//     fetch("http://localhost:5000/admin/users") // Backend API
//       .then((res) => res.json())
//       .then((data) => {
//         const sortedUsers = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
//         setUsers(sortedUsers);
//       })
//       .catch((err) => console.error("Error fetching users:", err));
//   }, []);
//   const [editingUser, setEditingUser] = useState(null);
//   const [editedData, setEditedData] = useState({ fullName: "", email: "", role: "" });

//   const startEditing = (selectedUser) => {
//     setEditingUser(selectedUser.email);
//     setEditedData({ fullName: selectedUser.fullName, email: selectedUser.email, role: selectedUser.role });
//   };

//   // const saveUser = (email) => {
//   //   setUsers(user.map(user => (user.email === email ? { ...user, ...editedData } : user)));
//   //   setEditingUser(null);
//   // };
//   const saveUser = (email) => {
//     setUsers(
//       user.map((u) => (u.email === email ? { ...u, ...editedData } : u))
//     );
//     setEditingUser(null);
//   };
//   // const deleteUser = (email) => {
//   //   setUsers(user.filter(user => user.email !== email));
//   // };
//   const deleteUser = async (email) => {
//     try {
//       const res = await fetch(`http://localhost:5000/admin/users/${email}`, {
//         method: "DELETE",
//       });
  
//       if (!res.ok) {
//         throw new Error("Failed to delete user");
//       }
  
//       setUsers(user.filter((u) => u.email !== email));
//     } catch (error) {
//       console.error("Error deleting user:", error);
//     }
//   };
//   return (
//     <div className="flex min-h-screen bg-gray-100">
//       {/* Sidebar */}
//       <Sidebar />

//       {/* Main Content */}
//       <div className="flex-1 p-6">
//         <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Users</h1>

//         {/* User Table */}
//         <div className="bg-white p-4 shadow rounded-lg">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-200 text-left">
//                 <th className="p-2">ID</th>
//                 <th className="p-2">Name</th>
//                 <th className="p-2">Email</th>
//                 <th className="p-2">Role</th>
//                 <th className="p-2">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//   {user
//     .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)) // Sort by latest users first
//     .map((user, index) => (
//       <tr key={user.email} className="border-b">
//         <td className="p-2">{index + 1}</td> {/* Row number */}
//         <td className="p-2">{user.fullName}</td>
//         <td className="p-2">{user.email}</td>
//         <td className="p-2">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</td>
//         <td className="p-2">
//           <button
//             className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
//             onClick={() => startEditing(user)}
//           >
//             Edit
//           </button>
//           <button
//             className="bg-red-500 text-white px-3 py-1 rounded ml-2 hover:bg-red-600"
//             onClick={() => deleteUser(user.email)}
//           >
//             Delete
//           </button>
//         </td>
//       </tr>
//     ))}
// </tbody>
//           </table>

//           {user.length === 0 && <p className="text-gray-500 text-center mt-4">No users found.</p>}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ManageUsers;
import React, { useState, useEffect } from "react";
import Sidebar from "../../components/admin/Sidebar";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [source, setSource] = useState("remote"); // 'remote' | 'local'
  const [editingUser, setEditingUser] = useState(null);
  const [editedData, setEditedData] = useState({ fullName: "", email: "", role: "" });

  // Normalize role to lowercase for storage/logic
  const normalizeUser = (u) => ({
    ...u,
    role: (u.role || "user").toString().toLowerCase(),
    createdAt: u.createdAt || new Date().toISOString(),
  });

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch("https://zidio-task-management-backend.onrender.com/admin/users");
        if (!res.ok) throw new Error(`Remote fetch failed: ${res.status}`);
        const data = await res.json();
        const normalized = Array.isArray(data) ? data.map(normalizeUser) : [];
        if (normalized.length > 0) {
          const sortedUsers = normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setUsers(sortedUsers);
          setSource("remote");
          return;
        }
        // If remote returned empty, fall through to local
        throw new Error("Remote returned no users");
      } catch (err) {
        // Fallback to local storage or seed demo users
        console.warn("Using local users fallback:", err.message || err);
        const local = JSON.parse(localStorage.getItem("users") || "null");
        if (Array.isArray(local) && local.length > 0) {
          const normalizedLocal = local.map(normalizeUser).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setUsers(normalizedLocal);
          setSource("local");
        } else {
          // Seed demo users (aligned with login demo accounts)
          const demo = [
            { fullName: "Admin User", email: "admin@example.com", role: "admin", userId: "admin-123", createdAt: new Date(Date.now() - 86400000).toISOString() },
            { fullName: "Regular User", email: "user@example.com", role: "user", userId: "user-456", createdAt: new Date(Date.now() - 43200000).toISOString() },
          ].map(normalizeUser);
          localStorage.setItem("users", JSON.stringify(demo));
          setUsers(demo);
          setSource("local");
        }
      }
    };
    loadUsers();
  }, []);

  const startEditing = (user) => {
    setEditingUser(user.email);
    setEditedData({ fullName: user.fullName, email: user.email, role: user.role });
  };

  const handleChange = (e) => {
    setEditedData({ ...editedData, [e.target.name]: e.target.value });
  };

  const saveUser = async (email) => {
    if (source === "remote") {
      try {
        const res = await fetch(`https://zidio-task-management-backend.onrender.com/admin/users/${email}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(editedData),
        });
        if (!res.ok) throw new Error("Failed to update user");
      } catch (error) {
        console.error("Error updating user remotely:", error);
        // Non-blocking: still update UI for demo purposes
      }
    } else {
      // Persist to local storage
      const updated = users.map((u) => (u.email === email ? normalizeUser({ ...u, ...editedData }) : u));
      localStorage.setItem("users", JSON.stringify(updated));
      setUsers(updated);
    }
    // Update UI and exit edit mode
    setUsers((prev) => prev.map((u) => (u.email === email ? normalizeUser({ ...u, ...editedData }) : u)));
    setEditingUser(null);
  };

  const deleteUser = async (email) => {
    if (source === "remote") {
      try {
        const res = await fetch(`https://zidio-task-management-backend.onrender.com/admin/users/${email}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete user");
      } catch (error) {
        console.error("Error deleting user remotely:", error);
        // Continue to update UI in demo mode
      }
    } else {
      const updated = users.filter((u) => u.email !== email);
      localStorage.setItem("users", JSON.stringify(updated));
      setUsers(updated);
      return;
    }
    setUsers((prev) => prev.filter((u) => u.email !== email));
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Manage Users</h1>

        <div className="bg-white p-4 shadow rounded-lg">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">ID</th>
                <th className="p-2">Name</th>
                <th className="p-2">Email</th>
                <th className="p-2">Role</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.email} className="border-b">
                  <td className="p-2">{index + 1}</td>
                  <td className="p-2">
                    {editingUser === user.email ? (
                      <input
                        type="text"
                        name="fullName"
                        value={editedData.fullName}
                        onChange={handleChange}
                        className="border p-1 rounded"
                      />
                    ) : (
                      user.fullName
                    )}
                  </td>
                  <td className="p-2">{user.email}</td>
                  <td className="p-2">
                    {editingUser === user.email ? (
                      <select
                        name="role"
                        value={editedData.role}
                        onChange={handleChange}
                        className="border p-1 rounded"
                      >
                        <option value="admin">Admin</option>
                        <option value="user">User</option>
                      </select>
                    ) : (
                      user.role.charAt(0).toUpperCase() + user.role.slice(1)
                    )}
                  </td>
                  <td className="p-2">
                    {editingUser === user.email ? (
                      <button
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                        onClick={() => saveUser(user.email)}
                      >
                        Save
                      </button>
                    ) : (
                      <>
                        <button
                          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                          onClick={() => startEditing(user)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-500 text-white px-3 py-1 rounded ml-2 hover:bg-red-600"
                          onClick={() => deleteUser(user.email)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && <p className="text-gray-500 text-center mt-4">No users found.</p>}
          {users.length > 0 && (
            <p className="text-xs text-gray-400 mt-3">Source: {source === 'remote' ? 'Remote API' : 'Local demo data'}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;
