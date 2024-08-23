import React, { useEffect, useState } from 'react';
import Search from '../../components/Search';
import Pagination from '../../components/Pagination';
import { PacmanLoader } from 'react-spinners';
import { RootState } from '../../redux/store';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { setPages, setEnemyInfo, setLoading } from '../../redux/searchSlice';

function Home() {
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const { selectedCategory, currentPage, searchQuery, isLoading } = useSelector(
    (state: RootState) => ({
      selectedCategory: state.search.selected,
      currentPage: state.search.currentPage,
      searchQuery: state.search.searchParam,
      isLoading: state.search.loading,
    }),
    shallowEqual,
  );

  const dispatch = useDispatch();

  useEffect(() => {
    const loadData = async () => {
      dispatch(setLoading(true));
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:1234/search?category=${selectedCategory}&page=${currentPage}${
            searchQuery ? `&search=${searchQuery}` : ''
          }`,
          {
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const enemyInfo = await response.json();

        dispatch(setPages(Math.ceil(enemyInfo.count / 10)));
        dispatch(setEnemyInfo(enemyInfo.results));
      } catch (error) {
        if (!getCookie('session')) {
          window.location.href = '/login';
        }
        setError('An error occurred, try again');
        console.error('Error fetching data:', error);
      } finally {
        dispatch(setLoading(false));
      }
    };

    loadData();
  }, [selectedCategory, currentPage, searchQuery, dispatch]);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  return isLoading ? (
    <div className="w-full h-screen flex justify-center items-center">
      <PacmanLoader color="#4f46e5" size={40} />
    </div>
  ) : error ? (
    <div className="w-full h-screen flex justify-center items-center">
      <p className="text-red-600">{error}</p>{' '}
    </div>
  ) : (
    <>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[1000]">
          <div className="bg-white p-5 rounded-md w-full max-w-md shadow-md">
            <p className="text-black mb-10">
              Are you sure you want to log out ?
            </p>
            <div className="flex justify-between mt-5">
              <a
                href="http://localhost:1234/logout"
                className="px-5 py-2 bg-red-600 text-white rounded-md hover:opacity-90"
              >
                Confirm
              </a>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 bg-gray-500 text-white rounded-md hover:opacity-90"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="w-full flex flex-col">
        <header className="flex mb-5 items-center">
          <h1 className="ml-5 text-3xl font-semibold text-gray-800 p-4 rounded-md border-b-4 border-indigo-600">
            Empire Database
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="ml-auto mt-5 mr-5 group relative inline-block w-36 text-sm font-medium text-white focus:outline-none focus:ring"
          >
            <span className="absolute inset-0 border border-red-600 group-active:border-red-500"></span>
            <span className="block border border-red-600 bg-red-600 px-12 py-3 transition-transform active:border-red-500 active:bg-red-500 group-hover:-translate-x-1 group-hover:-translate-y-1">
              Logout
            </span>
          </button>
        </header>
        <Search />
        <Pagination />
      </div>
    </>
  );
}

export default Home;
