import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

/**
 * AdminRoute Component
 *
 * A protected route component specifically for admin users.
 *
 * Features:
 * - Checks if the user is authenticated
 * - Verifies the user has an admin role
 * - Redirects to admin login if not authenticated or not an admin
 * - Shows loading state while checking authentication
 * - Handles auth state changes (sign in/out)
 * - Beginner-friendly with detailed comments
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - The child components to render if the user is an admin
 * @returns {React.ReactNode} The rendered children or redirect
 */
export default function AdminRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdmin = async () => {
      // Get the current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        // If there's an error or no user, redirect to admin login
        navigate('/admin/login');
        return;
      }

      try {
        // Fetch the user's profile to check their role
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (profileError || profile.role !== 'admin') {
          // If there's an error fetching the profile or user is not an admin, redirect
          navigate('/admin/login');
        } else {
          // If user is an admin, allow access
          setIsAdmin(true);
          setLoading(false);
        }
      } catch (error) {
        // Handle any unexpected errors
        console.error('Error checking admin status:', error);
        navigate('/admin/login');
      }
    };

    checkAdmin();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // If user signs out, redirect to admin login
        navigate('/admin/login');
      } else if (event === 'SIGNED_IN') {
        // If user signs in, re-check admin status
        checkAdmin();
      }
    });

    // Clean up the subscription on component unmount
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Show loading state while checking authentication and admin status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // If user is an admin, render the children
  return isAdmin ? children : null;
}