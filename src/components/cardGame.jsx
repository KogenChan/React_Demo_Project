import { generatePath, Link } from "react-router";
import Button from "./button";
import LazyLoadGameImage from "./lazyLoadGameImage";
import routes from "../routing/routes.min";
import { FormatDate } from "../utils/formatDate.min";
import ToggleFavorite from "./toggleFavorites";

export default function CardGame({ game }) {
   const genres = game.genres.map((genre) => genre?.name || 'n/a').join(', ');

   return (
      <div className="card bg-base-100 rounded-xs h-full" key={game.id}>
         <figure>
            <LazyLoadGameImage image={game.background_image} className={'aspect-16/9'} />
         </figure>
         <div className="card-body">
            <div className="flex justify-between content-start">
               <h4 className="card-title max-w-[90%]">{game?.name || 'n/a'}</h4>
               <ToggleFavorite data={game} className="text-xl max-h-6 pt-0.5 -mr-0.5" />
            </div>
            <small>{genres}</small>
            <p>{FormatDate(game?.released)}</p>
            <div className="card-actions justify-end">
               <Link to={generatePath(routes.games, { slug: game.slug, id: game.id })}>
                  <Button content={'Read more »'} />
               </Link>
            </div>
         </div>
      </div>
   );
};