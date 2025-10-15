import { useParams } from "react-router";
import useFetchData from "../../utils/useFetchData.min";
import { FormatDate } from "../../utils/formatDate.min";
import LazyLoadGameImage from "../../components/lazyLoadGameImage";
import ToggleFavorite from "../../components/toggleFavorites";
import LoaderOverlay from "../../components/loaderOverlay";
import Comments from "../../components/commentsSection";

export default function GamePage() {
   const { id } = useParams();
   const initialUrl = `https://api.rawg.io/api/games/${id}?key=a573aa1a094c472284ead365bbd77d53`;
   const { data, error, loading } = useFetchData(initialUrl);

   return (
      <>
         <LoaderOverlay loading={loading} />

         <main className="flex justify-center pt-20 pb-10">
            <div className="max-w-[64rem] px-4 pt-5 sm:pt-10 lg:pt-20">

               {/* Error */}
               {error && <article className="text-red-500">{error}</article>}

               {/* Game Info */}
               <div>
                  <div className="flex justify-between content-start pb-5">
                     <h1 className="text-3xl md:text-4xl text-accent font-semibold">{data?.name || 'n/a'}</h1>
                     <ToggleFavorite data={data} className="text-[32px] md:text-3xl max-h-9 pt-1" />
                  </div>
                  <div className="flex justify-between">
                     <p className="text-[20px]">Released on: {FormatDate(data?.released)}</p>
                     <p className="text-[20px]">Id: {id}, Rating: {data?.rating || 'n/a'}</p>
                  </div>

                  {/* Game Image */}
                  <div className="style-game-image flex justify-center pt-8">
                     <figure>
                        <LazyLoadGameImage image={data && data.background_image} />
                     </figure>
                  </div>

                  {/* Description */}
                  <p className="pt-5">About:</p>
                  <p>{data?.description_raw || 'n/a'}</p>
               </div>
            </div>
         </main>

         <Comments gameId={id} />
      </>
   );
};