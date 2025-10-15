import { createContext, useContext, useEffect, useState } from 'react';
import supabase from '../supabase/supabase-client';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
   const [session, setSession] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
      const initSession = async () => {
         const { data: { session }, error } = await supabase.auth.getSession();
         if (error) {
            console.error('Error fetching session:', error.message);
         }
         setSession(session);
         setLoading(false);
      };

      initSession();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
         (event, session) => {
            setSession(session);
         }
      );

      return () => {
         subscription.unsubscribe();
      };
   }, []);

   return (
      <SessionContext.Provider value={{ session, setSession, loading }}>
         {children}
      </SessionContext.Provider>
   );
};

export const useSession = () => {
   const context = useContext(SessionContext);
   if (!context) {
      throw new Error('useSession must be used within a SessionProvider');
   }
   return context;
};