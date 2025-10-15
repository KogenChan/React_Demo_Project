import { useEffect, useState } from "react";
import { useFavorites } from "../../context/FavoritesContext";
import LoaderOverlay from "../../components/loaderOverlay";
import CardGame from "../../components/cardGame";
import { PrivateRoute } from "../../routing/protectedRoute";

export default function AccountFavorites() {
   const { favorites } = useFavorites();
   const [games, setGames] = useState([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);

   useEffect(() => {
      const fetchFavoriteGames = async () => {
         if (!favorites || favorites.length === 0) {
            setGames([]);
            setLoading(false);
            return;
         }

         setLoading(true);
         setError(null);

         try {
            const key = "a573aa1a094c472284ead365bbd77d53";

            const requests = favorites.map((fav) =>
               fetch(`https://api.rawg.io/api/games/${fav.game_id}?key=${key}`)
                  .then((res) => {
                     if (!res.ok) throw new Error("Failed to fetch game " + fav.game_id);
                     return res.json();
                  })
            );

            const gameData = await Promise.all(requests);
            setGames(gameData);
         } catch (err) {
            setError(err.message);
         } finally {
            setLoading(false);
         }
      };

      fetchFavoriteGames();
   }, [favorites]);

   return (
      <PrivateRoute>
         <LoaderOverlay loading={loading} />

         <main className="flex justify-center pt-20 pb-10">
            <div className="container flex flex-wrap mx-[-16px]">
               <div className="flex justify-between w-full flex-col sm:flex-row px-4">
                  <h1 className="text-3xl md:text-4xl text-accent pt-5 sm:pt-10 lg:pt-20 pb-10 w-100">
                     Your Favorite Games
                  </h1>
               </div>

               {!loading && games.length === 0 && (
                  <div className="w-full text-center text-gray-400 px-4 pb-6">
                     You haven't added any favorites yet.
                  </div>
               )}

               {error && (
                  <div className="w-full text-red-500 px-4 pb-6">
                     Error loading favorites: {error}
                  </div>
               )}

               {games.map((game) => (
                  <div
                     key={game.id}
                     className="snap-start shrink-0 w-[100%] sm:w-[50%] lg:max-w-[33.33%] xl:w-[25%] px-4 pb-6"
                  >
                     <CardGame game={game} />
                  </div>
               ))}
            </div>
         </main>
      </PrivateRoute>
   );
};