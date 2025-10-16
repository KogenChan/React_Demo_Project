import { useState } from "react";
import Carousel from "../../components/carousel";
import CardGame from "../../components/cardGame.jsx";
import Sidebar from "../../components/sidebar.jsx";
import { VscSettings } from 'react-icons/vsc';
import { FiSearch } from 'react-icons/fi';
import { useGames } from "../../context/GameContext.jsx";
import LoaderOverlay from "../../components/loaderOverlay";

const CardSkeleton = () => (
   <div className="card bg-base-100 rounded-xs h-full animate-pulse">
      <figure className="relative w-full bg-base-300 aspect-video" />
      <div className="card-body min-h-[186px]">
         <div className="h-6 bg-base-300 rounded w-3/4 mb-2" />
         <div className="h-4 bg-base-300 rounded w-1/2 mb-2" />
         <div className="h-4 bg-base-300 rounded w-1/3" />
      </div>
   </div>
);

export default function Home() {
   const {
      games,
      gamesError,
      genres,
      platforms,
      gamesLoading,
   } = useGames();

   const [selectedGenre, setSelectedGenre] = useState("All");
   const [selectedPlatform, setSelectedPlatform] = useState("All");
   const [searchQuery, setSearchQuery] = useState("");
   const [isSidebarOpen, setSidebarOpen] = useState(false);

   const filteredGames = games?.results.filter((item) => {
      const matchesGenre = selectedGenre === "All" || item.genres?.some((g) => g.name === selectedGenre);
      const matchesPlatform = selectedPlatform === "All" || item.platforms?.some((p) => p.platform.name === selectedPlatform);
      const matchesSearch = searchQuery.trim() === "" || item.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGenre && matchesPlatform && matchesSearch;
   });

   const recentGames = games?.results
      ?.slice()
      .sort((a, b) => new Date(b.released) - new Date(a.released))
      .slice(0, 4);

   return (
      <>
         <LoaderOverlay loading={gamesLoading} />

         <main className="flex justify-center pt-20 pb-10 md:pb-20">
            <div className="container px-4">
               <h1 className="text-3xl md:text-4xl text-accent pt-5 sm:pt-10 lg:pt-20 pb-10">
                  Latest games
               </h1>
               {gamesError && <article className="text-red-500">{gamesError}</article>}
               
               <div className="min-h-[400px]">
                  {!games?.results ? (
                     <div className="flex overflow-x-auto mx-[-16px]">
                        {[...Array(4)].map((_, i) => (
                           <div key={i} className="shrink-0 w-[100%] sm:w-[50%] lg:max-w-[33.33%] xl:w-[25%] px-4">
                              <CardSkeleton />
                           </div>
                        ))}
                     </div>
                  ) : recentGames ? (
                     <Carousel items={recentGames} />
                  ) : null}
               </div>
            </div>
         </main>

         <section className="flex justify-center pb-10">
            <div className="container flex flex-wrap mx-[-16px]">
               <div className="flex justify-between w-full flex-col sm:flex-row px-4 mb-4 gap-4 min-h-[60px]">
                  <h2 className="text-3xl md:text-4xl text-accent pb-4 sm:pb-0">Explore games</h2>

                  <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
                     <div className="relative flex-1 sm:flex-initial sm:w-64">
                        <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-[20px]" />
                        <input
                           type="text"
                           placeholder="Search games..."
                           value={searchQuery}
                           onChange={(e) => setSearchQuery(e.target.value)}
                           className="w-full pl-10 pr-4 py-2 pt-[10px] bg-base-100 rounded-full focus:outline-none focus:ring-2 focus:ring-accent focus:bg-base-200 transition-all"
                        />
                     </div>

                     <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-[20px] flex justify-end items-center cursor-pointer whitespace-nowrap"
                     >
                        Filters
                        <VscSettings className="ml-2 text-xl ms-1" />
                     </button>
                  </div>
               </div>

               {!games?.results ? (
                  <>
                     {[...Array(8)].map((_, i) => (
                        <div
                           key={i}
                           className="snap-start shrink-0 w-[100%] sm:w-[50%] lg:max-w-[33.33%] xl:w-[25%] px-4 pb-6"
                        >
                           <CardSkeleton />
                        </div>
                     ))}
                  </>
               ) : filteredGames?.length === 0 ? (
                  <div className="w-full px-4 text-center py-10 text-gray-400 min-h-[200px]">
                     No games found matching your search.
                  </div>
               ) : (
                  filteredGames?.map((item) => (
                     <div
                        key={item.id}
                        className="snap-start shrink-0 w-[100%] sm:w-[50%] lg:max-w-[33.33%] xl:w-[25%] px-4 pb-6"
                     >
                        <CardGame game={item} />
                     </div>
                  ))
               )}
            </div>
         </section>

         <Sidebar
            genres={genres}
            platforms={platforms}
            selectedGenre={selectedGenre}
            selectedPlatform={selectedPlatform}
            onSelectGenre={setSelectedGenre}
            onSelectPlatform={setSelectedPlatform}
            isOpen={isSidebarOpen}
            onClose={() => setSidebarOpen(false)}
         />
      </>
   );
};
