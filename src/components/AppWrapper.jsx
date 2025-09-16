import { useAuth } from '../contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AppWrapper({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && pathname !== '/login') {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <div className="text-center py-10 text-gray-500">Loading...</div>;
  }

  if (!user && pathname !== '/login') {
    return null; // Don't render anything while redirecting
  }

  if (!user && pathname === '/login') {
    return <>{children}</>; // Render the Login page
  }

  return <>{children}</>;
}
