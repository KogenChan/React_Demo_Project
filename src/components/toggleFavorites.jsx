import { useFavorites } from "../context/FavoritesContext";
import { useSession } from "../context/SessionContext";
import { useNavigate, useLocation } from "react-router";
import { MdBookmarkAdded, MdOutlineBookmarkAdd } from "react-icons/md";

export default function ToggleFavorite({ data, className }) {
   const { favorites, addFavorite, removeFavorite } = useFavorites();
   const { session } = useSession();
   const navigate = useNavigate();
   const location = useLocation();

   const isFavorite = () => favorites?.find((el) => +el.game_id === data?.id);

   const handleClick = () => {
      if (!session) {
         navigate("/login", { state: { from: location } });
         return;
      }

      if (isFavorite()) {
         removeFavorite(data.id);
      } else {
         addFavorite(data);
      }
   };

   return (
      <button
         className={`cursor-pointer text-base-content ${className}`}
         onClick={handleClick}
         aria-label={isFavorite() ? "Remove from favorites" : "Add to favorites"}
      >
         {isFavorite() ? <MdBookmarkAdded /> : <MdOutlineBookmarkAdd />}
      </button>
   );
};