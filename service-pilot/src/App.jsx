import './index.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import AdminPanelPage from './pages/admin/AdminPanelPage'

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/'/>
          <Route path='admin/' element={<AdminPanelPage/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
