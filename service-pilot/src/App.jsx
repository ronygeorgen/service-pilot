import './index.css';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom'
import AdminPanelPage from './pages/admin/AdminPanelPage'
import WindowCleaningQuotePage from './pages/user/window-cleaning-quotePage';
import HomePage from './pages/user/home';
import LoginPage from './pages/admin/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import { QuoteProvider } from './context/QuoteContext';
import SuccessPagePage from './pages/user/SuccessPagePage';
import UserLoginPage from './pages/admin/userLoginPage';

function App() {
  return (
    <>
     <QuoteProvider>
      <Router>
        <Routes>
          <Route path='/' element={<ProtectedRoute><HomePage/></ProtectedRoute>} />
          <Route path='/admin' element={<AdminProtectedRoute><AdminPanelPage/></AdminProtectedRoute>}/>
          <Route path='admin/login' element={<LoginPage/>}/>
          <Route path='user/login' element={<UserLoginPage/>}/>
          <Route path='user/review/:quoteId' element={<WindowCleaningQuotePage/>}/>
          <Route path="/success" element={<SuccessPagePage />} />
        </Routes>
      </Router>
      </QuoteProvider>
    </>
  )
}

export default App
