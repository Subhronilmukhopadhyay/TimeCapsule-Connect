import { createBrowserRouter,RouterProvider } from 'react-router'
import Home from './pages/Home'
import Login from './pages/Login'
import './App.css'
import Register from './pages/Register';

// Define Routes with Loaders & Actions
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
]);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App;
