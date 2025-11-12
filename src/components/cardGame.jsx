import { generatePath, Link } from "react-router";
import Button from "./button";
import LazyLoadGameImage from "./lazyLoadGameImage";
import routes from "../routing/routes.min";
import { FormatDate } from "../utils/formatDate.min";
import ToggleFavorite from "./toggleFavorites";

export default function CardGame({ game }) {
   const genres = game.genres.map((genre) => genre?.name || 'n/a').join(', ');

   return (
      <div className="card bg-base-100 rounded-xs h-[400px] flex flex-col" key={game.id}>
         <figure className="relative w-full aspect-video">
            <LazyLoadGameImage image={game.background_image} className={'aspect-16/9'} />
         </figure>
         
         <div className="card-body flex-1 flex flex-col">
            <div className="flex justify-between content-start">
               <h4 className="card-title max-w-[90%] line-clamp-2 min-h-[1.6rem]">
                  {game?.name || 'n/a'}
               </h4>
               <ToggleFavorite data={game} className="text-xl max-h-6 pt-0.5 -mr-0.5" />
            </div>
            
            <small className="block min-h-4">
               {genres}
            </small>
            
            <p className="min-h-[1.2rem]">
               {FormatDate(game?.released)}
            </p>
            
            <div className="card-actions justify-end mt-auto min-h-8">
               <Link to={generatePath(routes.games, { slug: game.slug, id: game.id })}>
                  <Button content={'Read more »'} />
               </Link>
            </div>
         </div>
      </div>
   );
};