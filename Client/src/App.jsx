import { createBrowserRouter,RouterProvider } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register';
import TimeCapsulePage from './pages/TimeCapsulePage';
import './App.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    // errorElement: <ErrorPage />,
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/register",
    element: <Register />
  },
  {
    path: '/create-capsule',
    element: <TimeCapsulePage />
  },
  {
    path: '/create-capsule/:id',
    element: <TimeCapsulePage />
  },
]);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;
