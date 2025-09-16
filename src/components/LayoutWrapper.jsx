import { useEffect } from 'react'
import { useLocation } from 'react-router-dom';
import PrivateRoute from './PrivateRoute';

export default function LayoutWrapper({ children }) {
  const location = useLocation();

  // Add a body class when the app shows header/nav to disable global bg pattern
  useEffect(() => {
    const hasNav = location.pathname !== '/login'
    if (typeof document !== 'undefined') {
      if (hasNav) {
        document.body.classList.add('has-nav')
      } else {
        document.body.classList.remove('has-nav')
      }
    }
    return () => {
      if (typeof document !== 'undefined') {
        document.body.classList.remove('has-nav')
      }
    }
  }, [location.pathname])

  if (location.pathname === '/login') {
    return <div>{children}</div>;
  }

  return <PrivateRoute>{children}</PrivateRoute>;
}
