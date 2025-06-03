import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authenticatedLoader } from './services/authenticatedLoader';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TimeCapsulePage from './pages/TimeCapsulePage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css'
import Dashboard from './components/Dashboard/Dashboard';
import {Provider} from 'react-redux';
import store from '../src/store/store.js'

const router = createBrowserRouter([
  { 
    path: '/', 
    element: <Home />,
    // errorElement: <ErrorPage />, 
  },
  { 
    path: '/login', 
    element: <Login /> 
  },
  { 
    path: '/register', 
    element: <Register /> 
  },
  { 
    path: '/dashboard', 
    element: <Dashboard /> 
  },
  // {
  //   path: '/dashboard',
  //   element: <Dashboard />,
  //   loader: authenticatedLoader(),
  // },
  {
    path: '/create-capsule',
    element: <TimeCapsulePage />,
    loader: authenticatedLoader(),
  },
  {
    path: '/create-capsule/:id',
    element: <TimeCapsulePage />,
    loader: authenticatedLoader(),
  }, 
  {
    path: '*',
    element: <NotFoundPage />,
  }
]);

export default function App() {
  return (
    <>
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>
    </>
  )
}