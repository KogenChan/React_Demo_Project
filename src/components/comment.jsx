import { useState, useEffect } from 'react';
import supabase from '../supabase/supabase-client';
import useDownloadImage from '../utils/useDownloadImage';
import { PiUserCircleFill } from 'react-icons/pi';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import Button from './button';

export default function Comment({
   id,
   content,
   updatedAt,
   profileId,
   profileUsername,
   isNested = false,
   isFirstReply = false,
   isOwnComment = false,
   onEdit,
   onRemove,
   onReply,
   editingId,
   onStartEdit,
   onCancelEdit
}) {
   const [avatarUrl, setAvatarUrl] = useState(null);
   const [profileAvatarPath, setProfileAvatarPath] = useState(null);
   const isEditMode = editingId === id;
   const [localEditContent, setLocalEditContent] = useState(content);

   useEffect(() => {
      if (isEditMode) {
         setLocalEditContent(content);
      }
   }, [isEditMode, content]);

   useEffect(() => {
      const fetchProfileAvatar = async () => {
         try {
            const { data, error } = await supabase
               .from('profiles')
               .select('avatar_url')
               .eq('id', profileId)
               .single();
            if (error) throw error;
            if (data?.avatar_url) {
               setProfileAvatarPath(data.avatar_url);
            }
         } catch (err) {
            console.error('Error fetching profile avatar:', err);
         }
      };

      if (profileId) {
         fetchProfileAvatar();
      }
   }, [profileId]);

   useDownloadImage(profileAvatarPath, setAvatarUrl);

   const formatDate = (timestamp) => {
      if (!timestamp) return '';
      const date = new Date(timestamp);
      return date.toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric'
      });
   };

   const handleEditSubmit = async () => {
      const trimmed = localEditContent.trim();
      if (!trimmed) return;

      try {
         await onEdit(id, trimmed);
         onCancelEdit();
      } catch (err) {
         console.error("Error in onEdit:", err);
      }
   };

   return (
      <article
         className={`${isEditMode ? 'p-0 mb-9' : isNested ? 'pb-0' : 'pb-6'} rounded-3xl bg-base-200 border-2 border-[#232d3f] ${isNested ? 'mt-2' : 'mt-9'}`}
      >
         <footer className={`flex justify-between items-center pl-5 pr-4 py-3`}>
            <div className="flex items-center">
               <p className="inline-flex items-center mr-3 text-sm text-gray-900 dark:text-white font-semibold">
                  {avatarUrl ? (
                     <img
                        className="mr-2 w-6 h-6 rounded-full object-cover"
                        src={avatarUrl}
                        alt={profileUsername}
                     />
                  ) : (
                     <PiUserCircleFill className="mr-2 w-6 h-6 text-accent" />
                  )}
                  {profileUsername}
               </p>
               <p className="text-sm text-gray-600 dark:text-gray-400">
                  <time pubdate="true" dateTime={updatedAt} title={new Date(updatedAt).toDateString()}>
                     {formatDate(updatedAt)}
                  </time>
               </p>
            </div>

            {isOwnComment && (
               <div className="dropdown dropdown-end">
                  <div
                     tabIndex={0}
                     role="button"
                     className="btn hover:bg-transparent hover:border-transparent active:bg-transparent active:border-transparent px-2"
                  >
                     <HiOutlineDotsHorizontal className="text-xl" />
                     <span className="sr-only">Comment settings</span>
                  </div>
                  <ul
                     tabIndex={0}
                     className="menu menu-sm dropdown-content bg-base-100 rounded-xs z-1 w-52 py-2 px-1.5 shadow"
                  >
                     <li>
                        <a
                           href="#"
                           className="hover:bg-base-200 ps-3 pe-1 rounded-4xl"
                           onClick={(e) => {
                              e.preventDefault();
                              onStartEdit(id, content);
                           }}
                        >
                           Edit
                        </a>
                     </li>
                     <li>
                        <a
                           href="#"
                           className="hover:bg-base-200 ps-3 pe-1 rounded-4xl"
                           onClick={(e) => {
                              e.preventDefault();
                              onRemove(id);
                           }}
                        >
                           Remove
                        </a>
                     </li>
                  </ul>
               </div>
            )}
         </footer>

         {isEditMode ? (
            <div>
               <textarea
                  value={localEditContent}
                  onChange={(e) => setLocalEditContent(e.target.value)}
                  className="w-full p-3 px-5 rounded-xs bg-base-300 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  rows="4"
               />
               <div className="flex gap-3 justify-end mt-1 mb-3 mx-3">
                  <Button
                     operation={onCancelEdit}
                     content="Cancel"
                     className="bg-secondary border-secondary"
                  />
                  <Button
                     operation={handleEditSubmit}
                     content="Save"
                  />
               </div>
            </div>
         ) : (
            <>
               <p className="text-gray-500 dark:text-gray-400 px-5">{content}</p>

               <div className="flex items-center mt-4 space-x-4 px-5">
                  {onReply && (
                     <button
                        type="button"
                        onClick={() =>
                           onReply({ id, profile_username: profileUsername })
                        }
                        className="flex items-center text-sm text-gray-400 hover:underline font-medium cursor-pointer"
                     >
                        <svg
                           className="mr-1.5 w-3.5 h-3.5"
                           aria-hidden="true"
                           xmlns="http://www.w3.org/2000/svg"
                           fill="none"
                           viewBox="0 0 20 18"
                        >
                           <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M5 5h5M5 8h2m6-3h2m-5 3h6m2-7H2a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h3v5l5-5h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1Z"
                           />
                        </svg>
                        Reply
                     </button>
                  )}
               </div>
            </>
         )}
      </article>
   );
};