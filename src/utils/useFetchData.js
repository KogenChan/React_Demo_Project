import { useState, useEffect, useCallback } from "react";

export default function useFetchData(initialUrl) {
   const [loading, setLoading] = useState(false);
   const [data, setData] = useState(null);
   const [error, setError] = useState(null);
   const [url, updateUrl] = useState(initialUrl);

   const load = useCallback(async () => {
      setData(null);
      if (!url) {
         setError("Error URL");
         setLoading(false);
         return;
      } else {
         setError(null);
      }
      setLoading(true);
      try {
         const response = await fetch(url);
         if (!response.ok) {
            throw new Error(response.statusText);
         }
         const fetchedData = await response.json();
         setData(fetchedData);
         setError(null);
         setLoading(false);
      } catch (err) {
         setError(err.message);
         setData(null);
         setLoading(false);
      }
   }, [url]);

   useEffect(() => {
      load();
   }, [load]);

   return {
      url,
      loading,
      error,
      data,
      load,
      updateUrl,
   };
};