import React, { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { setLoading, setTranslateToWookiee } from '../../redux/searchSlice';
import { PacmanLoader } from 'react-spinners';
import { makeSelectFieldsWithKeys } from '../../utils/utils';

function Chosen() {
  const [details, setDetails] = useState<null | string[][]>(null);
  const [error, setError] = useState<string | null>(null);
  const [hideWookie, setHideWookie] = useState<boolean>(false);
  const { category, id } = useParams();
  const selectLoadingAndTranslateToWookiee = makeSelectFieldsWithKeys({
    isLoading: (state: RootState) => state.search.loading,
    translateToWookiee: (state: RootState) => state.search.translateToWookiee,
  });
  const { isLoading, translateToWookiee } = useSelector(
    selectLoadingAndTranslateToWookiee,
  );
  const dispatch = useDispatch();

  const handleSetLoading = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch],
  );

  useEffect(() => {
    const fetchDetails = async () => {
      handleSetLoading(true);

      if (category === 'films') {
        setHideWookie(true);
      }

      try {
        const response = await fetch(
          `http://localhost:1234/search/${category}/${id}${translateToWookiee ? '?format=wookiee' : ''}`,
          {
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const result = await response.json();

        const {
          created,
          edited,
          url,
          oarcworaaowowa,
          wowaahaowowa,
          hurcan,
          ...filteredResult
        } = result;

        const detailsArray = Object.entries(filteredResult).map(
          ([key, value]) => [key, String(value)],
        );

        const fetchRelatedData = async (url: string) => {
          const apiUrlPart = url.split('api/')[1];
          if (!apiUrlPart) return null;
          try {
            const response = await fetch(
              `http://localhost:1234/search/detail/${apiUrlPart}`,
              {
                credentials: 'include',
              },
            );

            if (!response.ok) {
              throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              const jsonResponse = await response.json();
              return jsonResponse;
            } else {
              return await response.text();
            }
          } catch (error) {
            console.error(`Error fetching data from URL: ${url}`, error);
            return null;
          }
        };

        const processArrayData = async (enemyInfo: string[]) => {
          const urls = enemyInfo[1].split(',').filter(Boolean);

          const fetchedData = await Promise.all(urls.map(fetchRelatedData));
          return [enemyInfo[0], fetchedData];
        };

        const isMultipleUrls = (str: string) => {
          return (
            str.includes(',') &&
            str.split(',').every((url) => url.trim().startsWith('http'))
          );
        };

        const enrichedDetails = await Promise.all(
          detailsArray.map(async (enemyInfoDetails) => {
            if (
              enemyInfoDetails[1] &&
              enemyInfoDetails[1].includes('https://')
            ) {
              if (isMultipleUrls(enemyInfoDetails[1])) {
                return await processArrayData(enemyInfoDetails);
              } else {
                const fetchedData = await fetchRelatedData(enemyInfoDetails[1]);
                return [enemyInfoDetails[0], fetchedData];
              }
            }
            if (enemyInfoDetails[1].includes(',') && translateToWookiee) {
              return [
                enemyInfoDetails[0],
                enemyInfoDetails[1].split(',').filter(Boolean),
              ];
            } else {
              return enemyInfoDetails;
            }
          }),
        );

        setDetails(enrichedDetails);
        setError(null);
      } catch (error) {
        console.error('Error fetching details:', error);
        setError('An error occurred, try again');
      } finally {
        handleSetLoading(false);
      }
    };

    fetchDetails();
  }, [handleSetLoading, category, id, translateToWookiee]);

  const handlesWookiee = (changeLanguage: boolean) => {
    dispatch(setTranslateToWookiee(changeLanguage));
  };

  return isLoading ? (
    <div className="w-full h-screen flex justify-center items-center mt-auto">
      <PacmanLoader color="#4f46e5" size={40} />
    </div>
  ) : error ? (
    <div className="w-full h-screen flex justify-center items-center mt-auto">
      <p className="text-red-600">{error}</p>{' '}
    </div>
  ) : (
    <>
      <div className="flex items-center mb-5">
        <a
          className="inline-block rounded-full border border-indigo-600 p-3 text-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring active:bg-indigo-500 ml-5 mt-2"
          href="/"
        >
          <svg
            className="w-5 h-5 rtl:rotate-180"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </a>
        <h1 className="mx-auto my-5 text-3xl font-semibold text-gray-800 p-4 rounded-md border-b-4 border-indigo-600">
          Detailed Information
        </h1>

        {hideWookie ? null : (
          <div className="flex items-center mr-5">
            <label
              htmlFor="AcceptConditions"
              className="relative inline-block h-8 w-12 cursor-pointer [-webkit-tap-highlight-color:_transparent]"
            >
              <input
                type="checkbox"
                id="AcceptConditions"
                className="peer sr-only"
                checked={translateToWookiee}
                onChange={() => handlesWookiee(!translateToWookiee)}
              />

              <span className="absolute inset-0 m-auto h-2 rounded-full bg-gray-300"></span>

              <span className="absolute inset-y-0 start-0 m-auto size-6 rounded-full bg-gray-500 transition-all peer-checked:start-6 peer-checked:[&_>_*]:scale-0">
                <span className="absolute inset-0 m-auto size-4 rounded-full bg-gray-200 transition">
                  {' '}
                </span>
              </span>
            </label>
            <span className="ml-3">Wookie</span>
          </div>
        )}
      </div>

      <div className="flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
        <dl className="-my-3 divide-y divide-gray-100 text-sm">
          {details &&
            details.map((detail, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4"
              >
                <dt className="font-medium text-gray-900">
                  {detail[0].includes('_')
                    ? detail[0].replace(/_/g, ' ')
                    : detail[0]}
                </dt>
                <dd className="text-gray-700 sm:col-span-2">
                  {Array.isArray(detail[1])
                    ? detail[1].map((item: string, i: number) => (
                        <p key={i}>{item},</p>
                      ))
                    : detail[1] || 'none'}
                </dd>
              </div>
            ))}
        </dl>
      </div>
    </>
  );
}

export default Chosen;
