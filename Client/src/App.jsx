import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authenticatedLoader } from './services/authenticatedLoader';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TimeCapsulePage from './pages/TimeCapsulePage';
import './App.css'

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
]);

export default function App() {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}