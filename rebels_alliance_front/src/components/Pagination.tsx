import React from 'react';
import { useSelector, useDispatch, shallowEqual } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../redux/store';
import { setCurrentPage } from '../redux/searchSlice';

function Pagination() {
  const navigate = useNavigate();
  const { enemyInfo, totalPages, currentPage } = useSelector(
    (state: RootState) => ({
      enemyInfo: state.search.enemyInfo,
      totalPages: state.search.pages,
      currentPage: state.search.currentPage,
    }),
    shallowEqual,
  );

  const dispatch = useDispatch();

  const tableHeaders = enemyInfo[0]
    ? Object.keys(enemyInfo[0])
        .slice(0, 5)
        .filter((key) => key !== 'opening_crawl')
    : [];

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      dispatch(setCurrentPage(newPage));
    }
  };

  const generatePageNumbers = () => {
    const maxPagesToShow = 3;
    const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);

    let startPage = Math.max(currentPage - halfMaxPagesToShow, 1);
    const endPage = Math.min(startPage + maxPagesToShow - 1, totalPages);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(endPage - maxPagesToShow + 1, 1);
    }

    return Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i,
    );
  };

  const pageNumbers = generatePageNumbers();

  const handleRowClick = (id: string) => {
    navigate(`/choosen/${id}`);
  };

  return enemyInfo.length === 0 ? (
    <div className="bg-white p-4 border border-gray-300 rounded-md shadow-sm max-w-sm mx-auto mt-4">
      <h2 className="text-lg font-semibold text-red-600 mb-2">Not Found</h2>
      <p className="text-gray-700 mb-4">No results found for your search.</p>
      <a href="/" className="text-blue-500 hover:underline">
        Back to Home
      </a>
    </div>
  ) : (
    <div className="rounded-lg border border-gray-200">
      <div className="overflow-x-auto rounded-t-lg">
        <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
          <thead className="text-left">
            <tr>
              {tableHeaders.map((header, index) => (
                <th
                  key={index}
                  className="whitespace-nowrap px-4 py-2 font-medium text-gray-900"
                >
                  {header.includes('_') ? header.replace(/_/g, ' ') : header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {enemyInfo.map((enemyInfo, index: number) => {
              const baseUrl = 'https://swapi.dev/api/';

              let chosen: string = '';

              if (typeof enemyInfo.url === 'string') {
                chosen = enemyInfo.url.substring(baseUrl.length);
              }

              return (
                <tr
                  key={index}
                  onClick={() => handleRowClick(chosen)}
                  className="cursor-pointer"
                >
                  {Object.entries(enemyInfo as Record<string, string | number>)
                    .filter(([key]) => tableHeaders.includes(key))
                    .map(([key, value], index: number) => (
                      <td
                        key={index}
                        className="whitespace-nowrap px-4 py-2 font-medium text-gray-900"
                      >
                        {value !== undefined ? value : 'none'}
                      </td>
                    ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-b-lg border-t border-gray-200 px-4 py-2">
        <ol className="flex justify-end gap-1 text-xs font-medium">
          <li onClick={() => handlePageChange(currentPage - 1)}>
            <button className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>

          {pageNumbers.map((page) => (
            <li
              key={page}
              onClick={() => handlePageChange(page)}
              className="cursor-pointer"
            >
              <button
                className={`block size-8 rounded border ${
                  currentPage === page
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-gray-100 bg-white text-gray-900'
                } text-center leading-8`}
              >
                {page}
              </button>
            </li>
          ))}

          <li onClick={() => handlePageChange(currentPage + 1)}>
            <button className="inline-flex size-8 items-center justify-center rounded border border-gray-100 bg-white text-gray-900 rtl:rotate-180 cursor-pointer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="size-3"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default Pagination;
