import { useState, useEffect, useContext, useCallback, createContext } from "react";
import supabase from "../supabase/supabase-client";
import { useSession } from "./SessionContext";

const FavoritesContext = createContext(null);

export default function FavoritesProvider({ children }) {
   const { session } = useSession();
   const [favorites, setFavorites] = useState([]);

   const getFavorites = useCallback(async () => {
      const { data: favourites, error } = await supabase
         .from("favorites")
         .select("*")
         .eq("user_id", session?.user.id);

      if (!error) {
         setFavorites(favourites);
      }
   }, [session]);

   const addFavorite = async (game) => {
      await supabase
         .from("favorites")
         .insert([
            {
               user_id: session?.user.id,
               game_id: game.id,
               game_name: game.name,
               game_image: game.background_image,
            },
         ])
         .select();
   };

   const removeFavorite = async (gameId) => {
      await supabase
         .from("favorites")
         .delete()
         .eq("game_id", gameId)
         .eq("user_id", session?.user.id);
   };

   useEffect(() => {
      if (session) {
         getFavorites();
      } else {
         setFavorites([]);
      }

      const favoritesChannel = supabase
         .channel("favorites")
         .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "favorites" },
            () => getFavorites()
         )
         .subscribe();

      return () => {
         supabase.removeChannel(favoritesChannel);
         favoritesChannel.unsubscribe?.();
      };
   }, [getFavorites, session]);

   return (
      <FavoritesContext.Provider
         value={{
            favorites,
            setFavorites,
            addFavorite,
            removeFavorite,
         }}
      >
         {children}
      </FavoritesContext.Provider>
   );
};

export const useFavorites = () => {
   const context = useContext(FavoritesContext);
   if (!context) {
      throw new Error('useFavorites must be used within a FavoritesProvider');
   }
   return context;
};