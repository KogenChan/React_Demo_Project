import { useState, useRef, useEffect, Fragment, useMemo, useCallback } from "react";
import { FaChevronDown } from "react-icons/fa";

export default function Dropdown({ list, onSelect, value = "All" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (isOpen && inputRef.current) {
        if (event.key.length === 1 || event.key === 'Backspace') {
          inputRef.current.focus();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const handleSelect = useCallback((item) => {
    onSelect?.(item);
    setSearchQuery("");
    setIsOpen(false);
  }, [onSelect]);

  const handleToggle = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Memoize filtered items to prevent recalculation on every render
  const filteredItems = useMemo(() => {
    if (!list?.results) return [];
    if (searchQuery === "") return list.results;
    
    const lowerQuery = searchQuery.toLowerCase();
    return list.results.filter((item) =>
      item.name.toLowerCase().includes(lowerQuery)
    );
  }, [list?.results, searchQuery]);

  // Memoize highlight function to prevent recreation
  const highlightMatch = useCallback((name, query) => {
    if (!query) return name;
    const regex = new RegExp(`(${query})`, "gi");
    return name.split(regex).map((part, i) =>
      regex.test(part) ? (
        <span key={i} className="text-primary font-semibold">
          {part}
        </span>
      ) : (
        <Fragment key={i}>{part}</Fragment>
      )
    );
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        type="button"
        onClick={handleToggle}
        className="text-[18px] w-full flex justify-end items-center cursor-pointer"
      >
        {value}
        <FaChevronDown
          className={`ml-1 text-[18px] pt-0.5 transition-transform ${
            isOpen ? "rotate-180 translate-y-[1px]" : ""
          }`}
        />
      </button>

      {isOpen && (
        <ul
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 mt-2 w-52 bg-base-200 rounded-md shadow-lg max-h-60 overflow-y-auto z-10 p-2 px-1.5"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="absolute opacity-0 pointer-events-none"
            tabIndex={-1}
          />

          {searchQuery === "" && (
            <li>
              <a
                href="#!"
                onClick={() => handleSelect("All")}
                className="text-xs block pl-3 py-1.5 hover:bg-base-100 rounded-4xl cursor-pointer"
              >
                All
              </a>
            </li>
          )}

          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <li key={item.id}>
                <a
                  href="#!"
                  onClick={() => handleSelect(item.name)}
                  className="text-xs block pl-3 py-1.5 hover:bg-base-100 rounded-4xl cursor-pointer"
                >
                  {highlightMatch(item.name, searchQuery)}
                </a>
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-gray-400">No matches</li>
          )}
        </ul>
      )}
    </div>
  );
};