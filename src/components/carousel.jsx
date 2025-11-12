import { useRef, useState } from "react";
import CarouselButton from "./carouselButton";
import CardGame from "./cardGame";

export default function Carousel({ items }) {
   const scrollRef = useRef(null);
   const [touchStart, setTouchStart] = useState(0);
   const [touchEnd, setTouchEnd] = useState(0);
   const [currentIndex, setCurrentIndex] = useState(0);

   const minSwipeDistance = 50;

   const scrollByCards = (direction = 1) => {
      const container = scrollRef.current;
      if (!container) return;

      const card = container.querySelector(".card");
      if (!card) return;

      const cardWidth = card.offsetWidth + 20;
      container.scrollBy({ left: direction * cardWidth, behavior: "smooth" });

      setCurrentIndex((prev) => {
         const newIndex = prev + direction;
         return Math.max(0, Math.min(items.length - 1, newIndex));
      });
   };

   const onTouchStart = (e) => {
      setTouchEnd(0);
      setTouchStart(e.targetTouches[0].clientX);
   };

   const onTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
   };

   const onTouchEnd = () => {
      if (!touchStart || !touchEnd) return;

      const distance = touchStart - touchEnd;
      const isLeftSwipe = distance > minSwipeDistance;
      const isRightSwipe = distance < -minSwipeDistance;

      if (isLeftSwipe) {
         scrollByCards(1);
      } else if (isRightSwipe) {
         scrollByCards(-1);
      }
   };

   return (
      <div className="relative">
         <div className="hidden md:block">
            <CarouselButton direction="left" operation={scrollByCards} />
            <CarouselButton direction="right" operation={scrollByCards} />
         </div>

         <div
            id="scroll-container"
            ref={scrollRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={`flex scroll-smooth snap-x snap-mandatory mx-[-16px] min-h-[400px] overflow-x-hidden`}
         >
            {items.map((item) => (
               <div
                  key={item.id}
                  className="snap-start shrink-0 w-[100%] sm:w-[50%] lg:max-w-[33.33%] xl:w-[25%] px-4"
               >
                  <CardGame game={item} />
               </div>
            ))}
         </div>

         {/* # Pagination dots - visible on mobile only */}
         <div className="flex justify-center items-center gap-2 mt-[18px] md:hidden h-[16px]">
            {items.map((_, index) => (
               <div
                  key={index}
                  className={`rounded-full w-[14px] h-[14px] border-2 border-gray-300 flex justify-center items-center`}
               >
                  <div
                     className={`rounded-full transition-all ${index === currentIndex
                        ? "w-[6px] h-[6px] bg-primary"
                        : "bg-none"
                        }`}
                  />
               </div>
            ))}
         </div>
      </div>
   );
};