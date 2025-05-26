import './index.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import AdminPanelPage from './pages/admin/AdminPanelPage'
import WindowCleaningQuotePage from './pages/reviewPage/window-cleaning-quotePage';

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path='/'/>
          <Route path='admin/' element={<AdminPanelPage/>}/>
          <Route path='user/review/' element={<WindowCleaningQuotePage/>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App
