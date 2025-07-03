const ConflictModal = ({ conflict, onResolve, onClose }) => {
  const handleMerge = () => {
    const merged = {
      title: conflict.clientVersion.title || conflict.currentVersion.title,
      description: conflict.clientVersion.description || conflict.currentVersion.description,
      assignedUser: conflict.clientVersion.assignedUser || conflict.currentVersion.assignedUser,
      status: conflict.clientVersion.status || conflict.currentVersion.status,
      priority: conflict.clientVersion.priority || conflict.currentVersion.priority,
      lastModified: new Date(),
    };
    onResolve(merged, conflict.currentVersion._id);
  };

  const handleOverwrite = (version) => {
    onResolve({ ...version, lastModified: new Date() }, conflict.currentVersion._id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="glass p-6 rounded-xl w-full max-w-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Conflict Detected</h2>
        <p className="text-gray-600 mb-4">Two versions of the task exist. Choose how to resolve:</p>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <h3 className="font-bold">Your Version</h3>
            <p>Title: {conflict.clientVersion.title}</p>
            <p>Description: {conflict.clientVersion.description}</p>
            <p>Status: {conflict.clientVersion.status}</p>
            <p>Priority: {conflict.clientVersion.priority}</p>
          </div>
          <div>
            <h3 className="font-bold">Current Version</h3>
            <p>Title: {conflict.currentVersion.title}</p>
            <p>Description: {conflict.currentVersion.description}</p>
            <p>Status: {conflict.currentVersion.status}</p>
            <p>Priority: {conflict.currentVersion.priority}</p>
          </div>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleMerge}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Merge
          </button>
          <button
            onClick={() => handleOverwrite(conflict.clientVersion)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Use Mine
          </button>
          <button
            onClick={() => handleOverwrite(conflict.currentVersion)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Use Current
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal;