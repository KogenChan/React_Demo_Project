import { useEffect, useState } from "react";
import supabase from "../supabase/supabase-client";

export const useGetProfile = (session, refreshKey = 0) => {
   const [loading, setLoading] = useState(true);
   const [profile, setProfile] = useState(null);
   const [error, setError] = useState(null);

   useEffect(() => {
      let ignore = false;

      const getProfile = async () => {
         if (!session || !session.user) {
            setProfile(null);
            setLoading(false);
            return;
         }

         setLoading(true);
         const { user } = session;

         try {
            const { data, error: fetchError } = await supabase
               .from('profiles')
               .select('username, first_name, last_name, avatar_url')
               .eq('id', user.id)
               .single();

            if (!ignore) {
               if (fetchError) {
                  setError(fetchError);
               } else if (data) {
                  setProfile({
                     username: data.username,
                     firstName: data.first_name || "",
                     lastName: data.last_name || "",
                     avatarUrl: data.avatar_url,
                     email: session.user.email
                  });
                  setError(null);
               }
            }
         } catch (err) {
            if (!ignore) {
               setError(err);
            }
         } finally {
            if (!ignore) setLoading(false);
         }
      };

      getProfile();

      return () => {
         ignore = true;
      };
   }, [session, refreshKey]);

   const updateProfile = async (updates) => {
      if (!session || !session.user) return;

      try {
         const { error: updateError } = await supabase
            .from('profiles')
            .upsert({
               id: session.user.id,
               ...updates,
               updated_at: new Date()
            });

         if (updateError) {
            throw updateError;
         }

         // Refetch the profile to ensure we have the latest data
         const { data, error: fetchError } = await supabase
            .from('profiles')
            .select('username, first_name, last_name, avatar_url')
            .eq('id', session.user.id)
            .single();

         if (fetchError) {
            throw fetchError;
         }

         // Update state with fresh data from database
         setProfile({
            username: data.username,
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            avatarUrl: data.avatar_url,
            email: session.user.email
         });

         return { success: true };
      } catch (err) {
         return { success: false, error: err };
      }
   };

   return {
      loading,
      profile,
      error,
      updateProfile
   };
};