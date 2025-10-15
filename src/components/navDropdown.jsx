import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { generatePath, Link } from "react-router";

export default function NavDropdown({ list, label, routePath, slugKey = 'slug', nameKey = 'name', additionalState = {} }) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef(null);

   useEffect(() => {
      function handleClickOutside(event) {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
         }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
   }, []);

   return (
      <div ref={dropdownRef} className="relative inline-block hover:bg-base-100 p-0 rounded-4xl">
         <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex justify-start items-center cursor-pointer px-3 py-[6px]"
         >
            {label}
            <FaChevronDown
               className={`ml-2 ms-1 pt-1 transition-transform duration-300 ease-in-out ${isOpen ? "rotate-540 translate-y-[4px]" : ""}`}
            />
         </button>

         {isOpen && (
            <ul className="absolute right-[-8px] mt-2 w-52 bg-base-100 rounded-md shadow-lg max-h-60 overflow-y-auto z-10 p-2 px-1.5">
               {list.results.map((item) => {
                  const stateData = { [nameKey]: item.name };
                  if (additionalState.idKey) {
                     stateData[additionalState.idKey] = item.id;
                  }
                  
                  return (
                     <li key={item.id}>
                        <Link
                           className="block pl-3 py-1.5 hover:bg-base-200 rounded-4xl cursor-pointer"
                           to={generatePath(routePath, { [slugKey]: item.slug })}
                           state={stateData}
                           onClick={() => setIsOpen(false)}
                        >
                           {item.name}
                        </Link>
                     </li>
                  );
               })}
            </ul>
         )}
      </div>
   );
};