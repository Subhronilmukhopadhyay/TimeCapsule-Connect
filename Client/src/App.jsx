import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { authenticatedLoader, redirectIfAuthenticatedLoader } from './services/authenticatedLoader';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TimeCapsulePage from './pages/TimeCapsulePage';
import CollaborativeCapsulePage from './pages/CollaborativeCapsulePage';
import NotFoundPage from './pages/NotFoundPage';
import './App.css'
import Dashboard from './pages/Dashboard.jsx';
import {Provider} from 'react-redux';
import store from '../src/store/store.js'
import Settings from '../src/components/Dashboard/Settings.jsx'
import ContentArea from '../src/components/Dashboard/ContentArea.jsx'
import Explore from '../src/components/Dashboard/Explore.jsx'
import MyCapsules from './components/Dashboard/MyCapsules.jsx';
import SharedWithMe from './components/Dashboard/SharedWithMe.jsx'
const router = createBrowserRouter([
  { 
    path: '/', 
    loader: redirectIfAuthenticatedLoader(),
    element: <Home />,
    // errorElement: <ErrorPage />, 
  },
  { 
    path: '/login', 
    element: <Login />,
    loader: redirectIfAuthenticatedLoader(),
  },
  { 
    path: '/register', 
    element: <Register />,
    loader: redirectIfAuthenticatedLoader(),
  },
  { 
    path: '/dashboard', 
    element: <Dashboard /> ,
    // loader: authenticatedLoader(),
    children:[
      {
        index:true,
        element:<ContentArea/>
      },
      {
        path:'settings',
        element:<Settings/>
      },
      {
        path:'explore',
        element:<Explore/>
      },
      {
        path:'my-capsules',
        element:<MyCapsules/>
      },
      {
        path:'shared-with-me',
        element:<SharedWithMe/>
      }
    ],
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
    element: <CollaborativeCapsulePage />,
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