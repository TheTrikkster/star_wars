import React, { useEffect } from 'react';
import Search from '../../components/Search';
import Pagination from '../../components/Pagination';
import { PacmanLoader } from 'react-spinners';
import { RootState } from '../../redux/store';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { setPages, setEnemyInfo, setLoading } from '../../redux/searchSlice';

function Home() {
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
      try {
        dispatch(setLoading(true));

        const response = await fetch(
          `http://localhost:1234/search?category=${selectedCategory}&page=${currentPage}${
            searchQuery ? `&search=${searchQuery}` : ''
          }`,
          {
            credentials: 'include',
          },
        );

        const enemyInfo = await response.json();

        dispatch(setPages(Math.ceil(enemyInfo.count / 10)));
        dispatch(setEnemyInfo(enemyInfo.results));
      } catch (error) {
        if (!getCookie('session')) {
          window.location.href = '/login';
        }
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
  ) : (
    <div className="w-full flex flex-col">
      <header className="flex mb-5 items-center">
        <h1 className="ml-5 text-3xl font-semibold text-gray-800 p-4 rounded-md border-b-4 border-indigo-600">
          Empire Database
        </h1>
        <div className="ml-auto mt-5 mr-5">
          <a
            className="group relative inline-block w-36 text-sm font-medium text-white focus:outline-none focus:ring"
            href="http://localhost:1234/logout"
          >
            <span className="absolute inset-0 border border-red-600 group-active:border-red-500"></span>
            <span className="block border border-red-600 bg-red-600 px-12 py-3 transition-transform active:border-red-500 active:bg-red-500 group-hover:-translate-x-1 group-hover:-translate-y-1">
              Logout
            </span>
          </a>
        </div>
      </header>
      <Search />
      <Pagination />
    </div>
  );
}

export default Home;
