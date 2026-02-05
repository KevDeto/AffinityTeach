import './App.css'
import Containerreview from './components/layout/containerreview/Containerreview'
import Containerhome from './components/layout/containerhome/Containerhome'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {

  return (
    <Router>

      <Routes className='bg-fondo bg-none min-h-screen max-w-screen'>
        {/* Contenedor sólido que cubra posibles patrones */}
        <Route path="/" element={<Containerhome />} />
        <Route path="/docente/:id/reviews" element={<Containerreview />} />
      </Routes>

    </Router>
  )
}

export default App
