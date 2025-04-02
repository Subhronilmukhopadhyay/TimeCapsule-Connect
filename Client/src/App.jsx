import { createBrowserRouter,RouterProvider } from 'react-router'
import Home from './pages/Home'
import './App.css'

// Define Routes with Loaders & Actions
const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    // errorElement: <ErrorPage />,
  },
  
]);

function App() {

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
