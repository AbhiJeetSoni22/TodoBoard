import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDrag, useDrop } from 'react-dnd';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ConflictModal from '../components/ConflictModel.jsx';

const ItemType = 'TASK';

const TaskCard = ({ task, users, handleUpdate, handleDelete, handleSmartAssign }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id: task._id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={drag}
    className={`bg-white/80 border cursor-grab border-gray-200 backdrop-blur-md p-4 mb-4 rounded-lg shadow-md transition-all duration-300 ease-in-out transform 
    ${isDragging ? 'opacity-50 scale-95 shadow-sm' : 'hover:shadow-xl'}`}
    >
      <h3 className="font-semibold text-gray-800 text-lg">{task.title}</h3>
      <p className="text-gray-600 text-sm mt-1">{task.description}</p>
      <p className="text-xs text-gray-500 mt-1">Priority: {task.priority}</p>
      <p className="text-xs text-gray-500">Assigned: {task.assignedUser?.name || 'Unassigned'}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => handleUpdate(task)}
          className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(task._id)}
          className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition"
        >
          Delete
        </button>
        <button
          onClick={() => handleSmartAssign(task._id)}
          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition"
        >
          Smart Assign
        </button>
      </div>
    </div>
  );
};

const Column = ({ status, tasks, users, handleDrop, handleUpdate, handleDelete, handleSmartAssign }) => {
  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item) => handleDrop(item.id, status),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`flex-1 bg-white/50 p-4 rounded-lg border border-gray-200 backdrop-blur-md ${
        isOver ? 'ring-2 ring-purple-300' : ''
      }`}
    >
      <h2 className="text-xl font-bold text-gray-700 mb-4">{status}</h2>
      {tasks.map((task) => (
        <TaskCard
          key={task._id}
          task={task}
          users={users}
          handleUpdate={handleUpdate}
          handleDelete={handleDelete}
          handleSmartAssign={handleSmartAssign}
        />
      ))}
    </div>
  );
};

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [actions, setActions] = useState([]);
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [conflict, setConflict] = useState(null);
  const { user, socket, logout,loading,haveToken } = useContext(AuthContext);
  const navigate = useNavigate();


  useEffect(() => {
    
  if (haveToken===false && !user) {
    navigate('/login');
  }
}, [user, loading, navigate,logout]);


  useEffect(() => {
   
      
   

    const fetchData = async () => {
      try {
        const [tasksRes, actionsRes, usersRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/tasks`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/actions`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/api/users`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
          }),
        ]);
      
        setTasks(tasksRes.data);
        setActions(actionsRes.data);
        setUsers(usersRes.data);
      } catch (err) {
        if (err.response?.status === 401) logout();
      }
    };

    if(user){

        fetchData();
    }


    if (socket) {
      socket.on('taskUpdate', (updatedTask) => {
        setTasks((prev) => prev.map((task) => (task._id === updatedTask._id ? updatedTask : task)));
      });
      socket.on('taskDelete', (taskId) => {
        setTasks((prev) => prev.filter((task) => task._id !== taskId));
      });
      socket.on('actionUpdate', (action) => {
        setActions((prev) => [action, ...prev.slice(0, 19)]);
      });

      return () => {
        socket.off('taskUpdate');
        socket.off('taskDelete');
        socket.off('actionUpdate');
      };
    }
  }, [user, socket, navigate, logout]);

  const handleDrop = async (taskId, newStatus) => {
    try {
      const task = tasks.find((t) => t._id === taskId);
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`,
        { ...task, status: newStatus, lastModified: task.lastModified },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (err) {
      if (err.response?.status === 409) setConflict(err.response.data);
    }
  };

  const handleUpdate = (task) => {
    setCurrentTask(task);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setCurrentTask(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (taskId) => {
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSmartAssign = async (taskId) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}/smart-assign`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleConflictResolve = async (resolution, taskId) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/api/tasks/${taskId}`,
        resolution,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setConflict(null);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-purple-100 via-indigo-100 to-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="md:text-4xl text-2xl font-extrabold text-gray-800">📋 To-Do Board</h1>
        <div className="flex gap-2 md:gap-4">
          <button
            onClick={handleCreate}
            className="md:px-4 py-1 px-1 md:py-2 text-sm md:text-lg  bg-purple-500 text-white rounded-lg hover:bg-purple-600 "
          >
            + New Task
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 flex flex-col md:flex-row gap-4">
          {['Todo', 'In Progress', 'Done'].map((status) => (
            <Column
              key={status}
              status={status}
              tasks={tasks.filter((task) => task.status === status)}
              users={users}
              handleDrop={handleDrop}
              handleUpdate={handleUpdate}
              handleDelete={handleDelete}
              handleSmartAssign={handleSmartAssign}
            />
          ))}
        </div>

        <div className="w-full md:w-80 bg-white/80 border border-gray-200 backdrop-blur-md p-4 rounded-lg shadow">
          <h2 className="text-xl font-bold text-gray-700 mb-4">🕓 Activity Log</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
            {actions.map((action) => (
              <div key={action._id} className="p-2 bg-white/60 rounded-lg">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">{action.user?.name}</span> {action.action}: {action.details}
                </p>
                <p className="text-xs text-gray-500">{new Date(action.timestamp).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TaskModal
          task={currentTask}
          users={users}
          onClose={() => setIsModalOpen(false)}
          onSave={() => setTasks([...tasks])}
        />
      )}

      {conflict && (
        <ConflictModal
          conflict={conflict}
          onResolve={handleConflictResolve}
          onClose={() => setConflict(null)}
        />
      )}
    </div>
  );
};

export default KanbanBoard;
