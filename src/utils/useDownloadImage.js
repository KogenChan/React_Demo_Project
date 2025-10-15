import { useEffect } from "react";
import supabase from "../supabase/supabase-client";
import avatarCache from "./avatarCache.min.js";

export default function useDownloadImage(url, setImageUrl) {
   useEffect(() => {
      const downloadImage = async (path) => {
         try {
            const { data, error } = await supabase.storage.from("avatars").download(path);
            if (error) throw error;

            const blobUrl = URL.createObjectURL(data);
            avatarCache.set(path, blobUrl);
            setImageUrl(blobUrl);
         } catch (error) {
            console.error("Error downloading image:", error.message);
         }
      };

      if (!url) {
         setImageUrl(null);
         return;
      }

      if (url.startsWith("http") || url.startsWith("blob:")) {
         setImageUrl(url);
         return;
      }

      const cached = avatarCache.get(url);
      if (cached) {
         setImageUrl(cached);
         return;
      }

      downloadImage(url);
   }, [url, setImageUrl]);
};