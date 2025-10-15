import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { getFieldError } from '../../lib/validationForm';
import supabase from "../../supabase/supabase-client";
import routes from "../../routing/routes.min";
import AuthForm from "../../components/authForm";
import { minLoadingTime } from "../../utils/minLoadingTime.min";
import { PublicRoute } from "../../routing/protectedRoute";

export default function Login() {
   const navigate = useNavigate();
   const location = useLocation();
   const from = location.state?.from?.pathname || routes.home;
   const redirectTo = from === routes.login ? routes.home : from;
   const [formSubmitted, setFormSubmitted] = useState(false);
   const [formErrors, setFormErrors] = useState({});
   const [touchedFields, setTouchedFields] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [formState, setFormState] = useState({
      email: "",
      password: ""
   });

   const onSubmit = async (event) => {
      event.preventDefault();
      setFormSubmitted(true);
      setIsLoading(true);

      try {
         const shouldNavigate = await minLoadingTime(async () => {
            const errors = {};
            if (!formState.email) {
               errors.email = "Email is required";
            }
            if (!formState.password) {
               errors.password = "Password is required";
            }

            if (Object.keys(errors).length > 0) {
               setFormErrors(errors);
               return false;
            }

            const { error } = await supabase.auth.signInWithPassword({
               email: formState.email,
               password: formState.password
            });

            if (error) {
               const message = error.message;
               setFormErrors({
                  email: /invalid/i.test(message) || /not found/i.test(message)
                     ? "Invalid email or password"
                     : message
               });
               return false;
            }

            return true;
         });

         if (shouldNavigate) {
            navigate(redirectTo, { replace: true });
         }
      } finally {
         setIsLoading(false);
      }
   };

   const onBlur = (field) => () => {
      const value = formState[field];
      const message = getFieldError(field, value);

      setFormErrors((prev) => ({
         ...prev,
         [field]: message
      }));

      setTouchedFields((prev) => ({
         ...prev,
         [field]: true
      }));
   };

   const setField = (field) => (e) => {
      const value = e.target.value;

      setFormState((prev) => ({
         ...prev,
         [field]: value
      }));

      if (touchedFields[field] || formSubmitted) {
         setFormErrors((prev) => ({
            ...prev,
            [field]: getFieldError(field, value)
         }));
      }
   };

   const isInvalid = (field) => {
      if (formSubmitted || touchedFields[field]) {
         return !!formErrors[field];
      }
      return undefined;
   };

   const contextValue = {
      formState,
      setField,
      onBlur,
      formErrors,
      isInvalid
   };

   const formFields = [
      { name: 'email', type: 'email' },
      { name: 'password', type: 'password' }
   ];

   return (
      <PublicRoute>
         <AuthForm
            title="Login"
            fields={formFields}
            onSubmit={onSubmit}
            isLoading={isLoading}
            contextValue={contextValue}
            link={{
               href: routes.register,
               label: "Don't have an account? Register"
            }}
         />
      </PublicRoute>
   );
};