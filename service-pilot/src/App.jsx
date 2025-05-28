import './index.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import AdminPanelPage from './pages/admin/AdminPanelPage'
import WindowCleaningQuotePage from './pages/user/window-cleaning-quotePage';
import HomePage from './pages/user/home';
import LoginPage from './pages/admin/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/' element={<HomePage/>} />
          <Route path='/admin' element={<ProtectedRoute><AdminPanelPage/></ProtectedRoute>}/>
          <Route path='admin/login' element={<LoginPage/>}/>
          <Route path='user/review/' element={<WindowCleaningQuotePage/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
