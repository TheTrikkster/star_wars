import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import {
  setSelected,
  setSearchParam,
  setCurrentPage,
  setSearchInput,
} from '../redux/searchSlice';
import { RootState } from '../redux/store';

const SearchWithDropdown = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const categories = [
    'people',
    'planets',
    'films',
    'species',
    'vehicles',
    'starships',
  ];

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { selectedCategory, searchInput } = useSelector(
    (state: RootState) => ({
      selectedCategory: state.search.selected,
      searchInput: state.search.searchInput,
    }),
    shallowEqual,
  );
  const dispatch = useDispatch();

  const handleCategorySelect = (category: string) => {
    dispatch(setSelected(category));
    dispatch(setSearchParam(null));
    dispatch(setCurrentPage(1));
    setIsDropdownOpen(false);
    dispatch(setSearchInput(''));
  };

  const handleKeyDownSearch = () => {
    dispatch(setSearchParam(searchInput));
    dispatch(setCurrentPage(1));
  };

  const handleInputSearch = (value: string) => {
    dispatch(setSearchInput(value));
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchInputKeyDown = debounce(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleKeyDownSearch();
      }
    },
    500,
  );

  return (
    <div className="relative text-center flex items-start space-x-0 max-w-xl mx-auto mb-28">
      <div ref={dropdownRef} className="relative w-28">
        <div
          className="flex items-center justify-between bg-white border border-gray-200 rounded-md shadow-sm p-2 cursor-pointer"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <span>{selectedCategory}</span>
          <svg
            className="w-5 h-5 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
        {isDropdownOpen && (
          <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg mt-1 max-h-60 overflow-auto">
            {categories.map((category) => (
              <li
                key={category}
                className={`p-2 hover:bg-gray-100 cursor-pointer flex items-center justify-between ${selectedCategory === category ? 'font-semibold text-indigo-600' : ''}`}
                onClick={() => handleCategorySelect(category)}
              >
                {category}
                {selectedCategory === category && (
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="relative flex-grow ml-2">
        <label className="sr-only">Search</label>
        <input
          type="text"
          id="Search"
          placeholder="Search for..."
          value={searchInput}
          className="w-96 rounded-md border border-gray-200 pl-5 py-2.5 pr-10 shadow-sm sm:text-sm"
          onChange={(event) => handleInputSearch(event.target.value)}
          onKeyDown={handleSearchInputKeyDown}
        />
        <span
          className="absolute inset-y-0 right-0 grid w-10 place-content-center border-l rounded-md"
          onClick={handleKeyDownSearch}
        >
          <button type="button" className="text-gray-600 hover:text-gray-700">
            <span className="sr-only">Search</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
          </button>
        </span>
      </div>
    </div>
  );
};

function debounce(
  func: (event: React.KeyboardEvent<HTMLInputElement>) => void,
  delay: number,
) {
  let timeoutId: NodeJS.Timeout;

  return function (
    this: void,
    ...args: [React.KeyboardEvent<HTMLInputElement>]
  ) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

export default SearchWithDropdown;
