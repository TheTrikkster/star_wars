import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { setLoading } from '../../redux/searchSlice';
import { PacmanLoader } from 'react-spinners';

function Chosen() {
  const [details, setDetails] = useState<null | string[][]>(null);
  const { id } = useParams();
  const location = useLocation();
  const isLoading = useSelector((state: RootState) => state.search.loading);
  const dispatch = useDispatch();

  const handleSetLoading = (loading: boolean) => {
    dispatch(setLoading(loading));
  };

  useEffect(() => {
    const fetchDetails = async () => {
      handleSetLoading(true);
      const queryString = `${id}${location.search}`;

      try {
        const response = await fetch(
          `http://localhost:1234/search/${queryString}`,
          {
            credentials: 'include',
          },
        );
        const result = await response.json();

        const { created, edited, url, ...filteredResult } = result;

        const detailsArray = Object.entries(filteredResult).map(
          ([key, value]) => {
            return [key, String(value)];
          },
        );

        const fetchRelatedData = async (url: string) => {
          const apiUrlPart = url.split('api/')[1];
          if (!apiUrlPart) return null;
          try {
            const response = await fetch(
              `http://localhost:1234/search/${apiUrlPart}`,
              {
                credentials: 'include',
              },
            );

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
            } else {
              return enemyInfoDetails;
            }
          }),
        );

        setDetails(enrichedDetails);
      } catch (error) {
        if (!getCookie('session')) {
          window.location.href = '/login';
        }

        console.error('Error fetching details:', error);
      } finally {
        handleSetLoading(false);
      }
    };

    fetchDetails();
  }, []);

  const getCookie = (name: string) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
  };

  return isLoading ? (
    <div className="w-full h-screen flex justify-center items-center mt-auto">
      <PacmanLoader color="#4f46e5" size={40} />
    </div>
  ) : (
    <>
      <div className="flex items-center">
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
      </div>

      <div className="flow-root rounded-lg border border-gray-100 py-3 shadow-sm">
        <dl className="-my-3 divide-y divide-gray-100 text-sm">
          {details &&
            details.map((detail, index) => (
              <div
                key={index}
                className="grid grid-cols-1 gap-1 p-3 sm:grid-cols-3 sm:gap-4"
              >
                <dt className="font-medium text-gray-900">{detail[0]}</dt>
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
