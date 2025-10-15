import { useState, useEffect } from "react";
import Dropdown from "./searchDropdown";
import Button from "./button";

export default function Sidebar({ genres, platforms, selectedGenre, selectedPlatform, onSelectGenre, onSelectPlatform, isOpen, onClose }) {
   const [isAnimating, setIsAnimating] = useState(false);
   const [shouldRender, setShouldRender] = useState(false);

   useEffect(() => {
      function handleKey(e) {
         if (e.key === "Escape") onClose();
      }
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
   }, [onClose]);

   useEffect(() => {
      if (isOpen) {
         setShouldRender(true);
         setTimeout(() => setIsAnimating(true), 10);
      } else {
         setIsAnimating(false);
         setTimeout(() => setShouldRender(false), 300);
      }
   }, [isOpen]);

   const handleResetAll = () => {
      onSelectGenre("All");
      onSelectPlatform("All");
   };

   const hasActiveFilters = selectedGenre !== "All" || selectedPlatform !== "All";

   if (!shouldRender) return null;

   return (
      <>
         <div
            className={`fixed inset-0 bg-black z-40 transition-opacity duration-300 ${isAnimating ? "opacity-50" : "opacity-0"
               }`}
            onClick={onClose}
         />

         <aside
            className={`fixed right-0 top-0 h-full w-80 bg-base-100 shadow-lg z-50 p-6 flex flex-col transform transition-transform duration-300 ease-in-out ${isAnimating ? "translate-x-0" : "translate-x-full"
               }`}
         >
            <button
               onClick={onClose}
               className="self-end mb-4 text-xl font-bold hover:text-accent cursor-pointer"
               aria-label="Close filters sidebar"
            >
               ✕
            </button>
            <h2 className="text-[28px] mb-4 text-accent">Filters</h2>
            {genres && (
               <div className="genresDropdown flex justify-between w-full content-center flex-wrap pb-5">
                  <h4 className="text-[18px]">Genre:</h4>
                  <Dropdown list={genres} onSelect={onSelectGenre} value={selectedGenre} />
               </div>
            )}
            {platforms && (
               <div className="platformsDropdown flex justify-between w-full content-center flex-wrap pb-5">
                  <h4 className="text-[18px]">Platform:</h4>
                  <Dropdown list={platforms} onSelect={onSelectPlatform} value={selectedPlatform} />
               </div>
            )}

            {hasActiveFilters && (
               <Button content={'Reset all filters'} operation={handleResetAll} />
            )}
         </aside>
      </>
   );
}