import './App.css'
import { useEffect } from 'react';
import Containerreview from './components/layout/containerreview/Containerreview'
import Containerhome from './components/layout/containerhome/Containerhome'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

function App() {
  useEffect(() => {
    useAuthStore.getState().initAuthListener();
  }, []);

  return (
    <Router>

      <Routes className='bg-fondo bg-none min-h-screen max-w-screen'>
        {/* Contenedor sólido que cubra posibles patrones */}
        <Route path="/" element={<Containerhome />} />
        <Route path="/api/docentes/:uid/resenas" element={<Containerreview />} />
      </Routes>

    </Router>
  )
}

export default App
