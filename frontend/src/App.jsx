import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

import AuthContextProvider from './context/AuthContext.jsx';
import KanbanBoard from './pages/KanbanBoard.jsx';

function App() {
  return (
    <AuthContextProvider>
      <DndProvider backend={HTML5Backend}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<KanbanBoard />} />
          </Routes>
        </Router>
      </DndProvider>
    </AuthContextProvider>
  );
}

export default App;