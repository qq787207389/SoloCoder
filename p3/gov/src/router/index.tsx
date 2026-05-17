import { createBrowserRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import Home from '../pages/Home';
import ServiceList from '../pages/ServiceList';
import ServiceDetail from '../pages/ServiceDetail';
import ApplicationForm from '../pages/ApplicationForm';
import ApplicationSuccess from '../pages/ApplicationSuccess';
import ProgressQuery from '../pages/ProgressQuery';
import PolicyList from '../pages/PolicyList';
import PolicyDetail from '../pages/PolicyDetail';
import Consultation from '../pages/Consultation';
import UserCenter from '../pages/UserCenter';
import Login from '../pages/Login';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '',
        element: <Home />,
      },
      {
        path: 'services',
        element: <ServiceList />,
      },
      {
        path: 'services/:id',
        element: <ServiceDetail />,
      },
      {
        path: 'apply/:serviceId',
        element: <ApplicationForm />,
      },
      {
        path: 'apply/success',
        element: <ApplicationSuccess />,
      },
      {
        path: 'progress',
        element: <ProgressQuery />,
      },
      {
        path: 'policies',
        element: <PolicyList />,
      },
      {
        path: 'policies/:id',
        element: <PolicyDetail />,
      },
      {
        path: 'consultation',
        element: <Consultation />,
      },
      {
        path: 'user',
        element: <UserCenter />,
      },
      {
        path: 'login',
        element: <Login />,
      },
    ],
  },
]);

export default router;
