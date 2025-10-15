import { createContext, useContext } from 'react';
import useFetchData from '../utils/useFetchData.min';

const GamesContext = createContext();

export function GamesProvider({ children }) {
   const initialUrl = "https://api.rawg.io/api/games?key=a573aa1a094c472284ead365bbd77d53&dates=2025-01-01,2025-12-31&page=1";
   const genreUrl = "https://api.rawg.io/api/genres?key=a573aa1a094c472284ead365bbd77d53&dates=2025-01-01,2025-12-31&page=1";
   const platformUrl = "https://api.rawg.io/api/platforms?key=a573aa1a094c472284ead365bbd77d53&dates=2025-01-01,2025-12-31&page=1";

   const {
      data: games,
      error: gamesError,
      loading: gamesLoading,
   } = useFetchData(initialUrl);

   const {
      data: genres,
      error: genresError,
      loading: genresLoading,
   } = useFetchData(genreUrl);

   const {
      data: platforms,
      error: platformsError,
      loading: platformsLoading,
   } = useFetchData(platformUrl);

   const availableGenres = genres?.results && games?.results
      ? genres.results.filter((genre) =>
         games.results.some((game) => game.genres?.some((g) => g.name === genre.name))
      )
      : [];

   const availablePlatforms = platforms?.results && games?.results
      ? platforms.results.filter((platform) =>
         games.results.some((game) => game.platforms?.some((p) => p.platform.name === platform.name))
      )
      : [];

   const value = {
      games,
      gamesError,
      gamesLoading,
      genres: { results: availableGenres },
      genresError,
      genresLoading,
      platforms: { results: availablePlatforms },
      platformsError,
      platformsLoading,
   };

   return (
      <GamesContext.Provider value={value}>
         {children}
      </GamesContext.Provider>
   );
};

export function useGames() {
   const context = useContext(GamesContext);
   if (!context) {
      throw new Error('useGames must be used within a GamesProvider');
   }
   return context;
};