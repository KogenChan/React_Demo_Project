import './global.css';
import { RouterProvider } from "react-router";
import Routing from "./routing/routing.min";
import { GamesProvider } from './context/GameContext';
import { SessionProvider } from './context/SessionContext';
import FavoritesProvider from './context/FavoritesContext';

function App() {

   return (
      <>
         <SessionProvider>
            <GamesProvider>
               <FavoritesProvider>
                  <RouterProvider router={Routing} />
               </FavoritesProvider>
            </GamesProvider>
         </SessionProvider>
      </>
   );
};

export default App;