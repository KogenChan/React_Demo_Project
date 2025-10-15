import { Navigate } from "react-router";
import { useSession } from "../context/SessionContext";
import routes from "./routes.min";
import LoaderOverlay from "../components/loaderOverlay";

export const PublicRoute = ({ children }) => {
   const { session, loading } = useSession();

   if (loading) {
      return <LoaderOverlay loading={loading} />
   }

   if (session) {
      return <Navigate to={routes.home} replace />;
   }

   return children;
};

export const PrivateRoute = ({ children }) => {
   const { session, loading } = useSession();

   if (loading) {
      return <LoaderOverlay loading={loading} />
   }

   if (!session) {
      return <Navigate to={routes.login} replace />;
   }

   return children;
};