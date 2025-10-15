import { PiUserCircleFill, PiList } from 'react-icons/pi';
import { Link, useLocation } from 'react-router';
import routes from '../routing/routes.min';
import { useGames } from '../context/GameContext';
import { useSession } from '../context/SessionContext';
import NavDropdown from './navDropdown';
import useLogout from '../utils/useLogout.min';
import { useGetProfile } from '../utils/useGetProfile';
import { useState, useEffect } from 'react';
import supabase from '../supabase/supabase-client';

export default function Navbar() {
   const { genres, platforms } = useGames();
   const [avatarUrl, setAvatarUrl] = useState(null);
   const [refreshKey, setRefreshKey] = useState(0);
   const { session } = useSession();
   const { profile } = useGetProfile(session, refreshKey);
   const location = useLocation();
   const { logout, isLoggingOut } = useLogout();


   // Listen for profile updates
   useEffect(() => {
      const handleProfileUpdate = () => {
         console.log('🔔 Profile update event received in navbar');
         setRefreshKey(prev => prev + 1);
      };

      window.addEventListener('profileUpdated', handleProfileUpdate);
      return () => window.removeEventListener('profileUpdated', handleProfileUpdate);
   }, []);

   // Handle avatar URL 
   useEffect(() => {

      if (!session || !profile?.avatarUrl) {
         setAvatarUrl(null);
         return;
      }

      const url = profile.avatarUrl;

      // If it's a blob URL from preview, use it directly
      if (url.startsWith('blob:')) {
         console.log('Using blob URL');
         setAvatarUrl(url);
         return;
      }

      // If it's already a full HTTP URL (legacy public URLs), use it directly
      if (url.startsWith('http')) {
         setAvatarUrl(url);
         return;
      }

      // Otherwise, it's a storage path - create a signed URL
      const getSignedUrl = async (path) => {
         try {
            const { data, error } = await supabase.storage
               .from('avatars')
               .createSignedUrl(path, 3600);

            if (error) {
               throw error;
            }

            setAvatarUrl(data.signedUrl + `&r=${Date.now()}`);
         } catch (error) {
            console.log('Error creating signed URL: ', error);
         }
      };

      getSignedUrl(url);
   }, [session, profile?.avatarUrl, refreshKey]);

   const handleLogout = () => {
      logout();
      document.activeElement?.blur();
   };

   const renderNavLinks = () => (
      <>
         <li>
            <Link className='hover:bg-base-100 px-3 rounded-4xl' to={routes.home}>Home</Link>
         </li>
         {genres && (
            <li>
               <NavDropdown
                  list={genres}
                  label="Genres"
                  routePath={routes.genres}
                  slugKey="genreSlug"
                  nameKey="genreName"
               />
            </li>
         )}
         {platforms && (
            <li>
               <NavDropdown
                  list={platforms}
                  label="Platforms"
                  routePath={routes.platforms}
                  slugKey="platformSlug"
                  nameKey="platformName"
                  additionalState={{ idKey: 'platformId' }}
               />
            </li>
         )}
      </>
   );

   const renderProfileMenu = () => (
      <ul
         tabIndex={0}
         className="menu menu-sm dropdown-content bg-base-100 rounded-xs z-1 mt-3 w-52 py-2 px-1.5 shadow"
      >
         {session ? (
            <>
               <li>
                  <Link
                     to={routes.favorites}
                     className="hover:bg-base-200 ps-3 pe-1 rounded-4xl"
                     onClick={() => document.activeElement?.blur()}
                  >
                     Favorites
                  </Link>
               </li>
               <li>
                  <Link
                     to={routes.settings}
                     className="hover:bg-base-200 ps-3 pe-1 rounded-4xl"
                     onClick={() => document.activeElement?.blur()}
                  >
                     Settings
                  </Link>
               </li>
               <li>
                  <button
                     onClick={handleLogout}
                     disabled={isLoggingOut}
                     className="hover:bg-base-200 ps-3 pe-1 rounded-4xl"
                  >
                     {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </button>
               </li>
            </>
         ) : (
            <>
               <li>
                  <Link
                     to={routes.login}
                     state={{ from: location }}
                     className="hover:bg-base-200 ps-3 pe-1 rounded-4xl"
                     onClick={() => document.activeElement?.blur()}
                  >
                     Login
                  </Link>
               </li>
               <li>
                  <Link
                     to={routes.register}
                     state={{ from: location }}
                     className="hover:bg-base-200 ps-3 pe-1 rounded-4xl"
                     onClick={() => document.activeElement?.blur()}
                  >
                     Sign up
                  </Link>
               </li>
            </>
         )}
      </ul>
   );

   return (
      <div className="navbar bg-base-200 shadow-sm absolute flex justify-center px-0">
         <div className="container flex justify-between px-4">
            <div className="w-25">
               <Link className="btn btn-ghost text-2xl text-accent p-0 lg:pt-2" to={routes.home}>
                  <h2>GameStar</h2>
               </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
               <ul className="menu menu-horizontal px-1">
                  {renderNavLinks()}
               </ul>
            </div>

            <div className="w-25 flex justify-end">
               <div className="dropdown dropdown-end lg:hidden">
                  <div tabIndex={0} role="button" className="btn btn-ghost px-2">
                     <PiList className='text-3xl text-accent' />
                  </div>
                  <ul
                     tabIndex={0}
                     className="menu menu-sm dropdown-content bg-base-100 rounded-xs z-1 mt-3 w-52 p-2 shadow"
                  >
                     {renderNavLinks()}
                  </ul>
               </div>

               <div className="dropdown dropdown-end">
                  <div tabIndex={0} role="button" className="btn px-0 lg:pt-3">
                     {avatarUrl ? (
                        <img
                           src={avatarUrl}
                           alt="User avatar"
                           className="rounded-full object-cover me-[-4px]"
                           width="40"
                           height="40"
                        />
                     ) : (
                        <PiUserCircleFill className='text-[40px] text-accent me-[-4px]' />
                     )}
                  </div>
                  {renderProfileMenu()}
               </div>
            </div>
         </div>
      </div>
   );
};