import { useState } from 'react';
import { useNavigate } from 'react-router';
import supabase from '../supabase/supabase-client';
import routes from '../routing/routes.min';
import avatarCache from './avatarCache.min';

export default function useLogout() {
   const navigate = useNavigate();
   const [isLoggingOut, setIsLoggingOut] = useState(false);
   const [error, setError] = useState(null);

   const logout = async (redirectTo = routes.home) => {
      setIsLoggingOut(true);
      setError(null);

      const { error: logoutError } = await supabase.auth.signOut();

      if (logoutError) {
         console.error('Error logging out:', logoutError);
         setError(logoutError.message);
         setIsLoggingOut(false);
         return false;
      }

      avatarCache.clear();

      setIsLoggingOut(false);
      navigate(redirectTo);
      return true;
   };

   return { logout, isLoggingOut, error };
}