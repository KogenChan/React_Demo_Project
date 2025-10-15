import { useRef } from "react";
import CarouselButton from "./carouselButton";
import CardGame from "./cardGame";

export default function Carousel({ items }) {
   const scrollRef = useRef(null);

   const scrollByCards = (direction = 1) => {
      const container = scrollRef.current;
      if (!container) return;

      const card = container.querySelector(".card");
      if (!card) return;

      const cardWidth = card.offsetWidth + 20;
      container.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
   };

   return (
      <div className="relative">
         <CarouselButton direction="left" operation={scrollByCards} />
         <CarouselButton direction="right" operation={scrollByCards} />

         <div
            id="scroll-container"
            ref={scrollRef}
            className="flex overflow-x-auto scroll-smooth snap-x snap-mandatory mx-[-16px]"
            style={{
               scrollbarWidth: "none",
               msOverflowStyle: "none",
            }}
         >
            <style>{`#scroll-container::-webkit-scrollbar {display: none;}`}</style>

            {items.map((item) => (
               <div
                  key={item.id}
                  className="snap-start shrink-0 w-[100%] sm:w-[50%] lg:max-w-[33.33%] xl:w-[25%] px-4"
               >
                  <CardGame game={item} />
               </div>
            ))}
         </div>
      </div>
   );
};
