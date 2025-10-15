import { Outlet } from "react-router";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

export default function Layout() {
   return (
      <div className="bg-base-300 min-h-screen flex flex-col justify-between">
         <div>
            <Navbar />
            <div>
               { }
               <Outlet />
            </div>
         </div>
         <Footer />
      </div>
   )
}