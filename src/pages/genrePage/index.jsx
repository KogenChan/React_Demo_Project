import { useLocation, useParams } from "react-router";
import { useEffect } from "react";
import CardGame from "../../components/cardGame";
import useFetchData from "../../utils/useFetchData.min";
import LoaderOverlay from "../../components/loaderOverlay";

export default function GenrePage() {
   const { genreSlug } = useParams();
   const location = useLocation();
   const genreName = location.state?.genreName || genreSlug;

   const {
      data,
      error,
      updateUrl,
      loading
   } = useFetchData();

   useEffect(() => {
      const url = `https://api.rawg.io/api/games?key=a573aa1a094c472284ead365bbd77d53&genres=${genreSlug}`;
      updateUrl(url);
   }, [genreSlug, updateUrl]);

   return (
      <>
         <LoaderOverlay loading={loading} />

         <main className="flex justify-center pt-20 pb-10">
            <div className="container flex flex-wrap mx-[-16px]">
               <div className="flex justify-between w-full flex-col sm:flex-row px-4">
                  <h1 className="text-3xl md:text-4xl text-accent pt-5 sm:pt-10 lg:pt-20 pb-10 w-100">
                     All {genreName} games
                  </h1>
               </div>

               {error && <article className="text-red-500">{error}</article>}

               {data?.results?.map((item) => (
                  <div
                     key={item.id}
                     className="snap-start shrink-0 w-[100%] sm:w-[50%] lg:max-w-[33.33%] xl:w-[25%] px-4 pb-6"
                  >
                     <CardGame game={item} />
                  </div>
               ))}
            </div>
         </main>
      </>
   );
};