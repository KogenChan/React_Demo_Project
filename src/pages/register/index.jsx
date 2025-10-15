import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { ConfirmSchema, getErrors, getFieldError } from '../../lib/validationForm';
import supabase from "../../supabase/supabase-client";
import routes from "../../routing/routes.min";
import AuthForm from "../../components/AuthForm";
import { minLoadingTime } from "../../utils/minLoadingTime.min";
import { PublicRoute } from "../../routing/protectedRoute";

export default function Register() {
   const navigate = useNavigate();
   const location = useLocation();
   const from = location.state?.from?.pathname || routes.home;
   const [formSubmitted, setFormSubmitted] = useState(false);
   const [formErrors, setFormErrors] = useState({});
   const [touchedFields, setTouchedFields] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [formState, setFormState] = useState({
      email: "",
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      repeat_password: ""
   });

   const onSubmit = async (event) => {
      event.preventDefault();
      setFormSubmitted(true);
      setIsLoading(true);

      try {
         const shouldNavigate = await minLoadingTime(async () => {
            const { error, data } = ConfirmSchema.safeParse(formState);
            if (error) {
               setFormErrors(getErrors(error));
               return false;
            }

            const { data: isAvailable, error: checkError } = await supabase
               .rpc('check_username_available', { username_to_check: data.username });

            if (checkError) {
               console.error('Error checking username:', checkError);
               return false;
            }

            if (!isAvailable) {
               setFormErrors((prev) => ({
                  ...prev,
                  username: "This username is already taken"
               }));
               return false;
            }

            const { error: signUpError } = await supabase.auth.signUp({
               email: data.email,
               password: data.password,
               options: {
                  data: {
                     first_name: data.firstName,
                     last_name: data.lastName,
                     username: data.username
                  }
               }
            });

            if (signUpError) {
               const message = signUpError.message;
               setFormErrors((prev) => ({
                  ...prev,
                  email: /already registered/.test(message)
                     ? "This email is already registered"
                     : /invalid/.test(message)
                        ? "This email address cannot be used"
                        : message
               }));
               return false;
            }

            return true;
         });

         if (shouldNavigate) {
            navigate(from, { replace: true });
         }
      } finally {
         setIsLoading(false);
      }
   };

   const checkUsernameAvailability = async (username) => {
      if (username.length < 3) return;
      const { data: isAvailable } = await supabase
         .rpc('check_username_available', { username_to_check: username });

      if (!isAvailable) {
         setFormErrors((prev) => ({
            ...prev,
            username: "This username is already taken"
         }));
      }
   };

   const onBlur = (field) => async () => {
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

      if (field === 'username' && !message && value.length >= 3) {
         await checkUsernameAvailability(value);
      }
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
      {
         type: 'grid',
         fields: [
            { name: 'firstName', type: 'text' },
            { name: 'lastName', type: 'text' }
         ]
      },
      { name: 'username', type: 'text' },
      { name: 'email', type: 'email' },
      { name: 'password', type: 'password' },
      { name: 'repeat_password', type: 'password' }
   ];

   return (
      <PublicRoute>
         <AuthForm
            title="Sign up"
            fields={formFields}
            onSubmit={onSubmit}
            isLoading={isLoading}
            contextValue={contextValue}
            link={{
               href: routes.login,
               label: "Already have an account? Login"
            }}
         />
      </PublicRoute>
   );
};