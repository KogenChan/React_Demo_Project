import { useEffect, useState } from "react";
import supabase from "../../supabase/supabase-client";
import { useSession } from "../../context/SessionContext";
import { useGetProfile } from "../../utils/useGetProfile";
import AuthForm from "../../components/AuthForm";
import { minLoadingTime } from "../../utils/minLoadingTime";
import { getFieldError } from "../../lib/validationForm";
import LoaderOverlay from "../../components/loaderOverlay";
import { PrivateRoute } from "../../routing/protectedRoute";
import z from "zod";

const ProfileSchema = z.object({
   email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
   firstName: z.string().min(1, "First name is required"),
   lastName: z.string().min(1, "Last name is required"),
   username: z.string().min(3, "Username must be at least 3 characters long")
});

export default function AccountSettings() {
   const { session } = useSession();
   const { loading, profile, updateProfile } = useGetProfile(session);

   const [formSubmitted, setFormSubmitted] = useState(false);
   const [formErrors, setFormErrors] = useState({});
   const [touchedFields, setTouchedFields] = useState({});
   const [isLoading, setIsLoading] = useState(false);
   const [successMessage, setSuccessMessage] = useState("");
   const [initialFormState, setInitialFormState] = useState({});
   const [formState, setFormState] = useState({
      email: "",
      username: "",
      firstName: "",
      lastName: "",
      avatar: ""
   });
   
   const [pendingAvatarFile, setPendingAvatarFile] = useState(null);
   const [avatarPreviewUrl, setAvatarPreviewUrl] = useState(null);

   useEffect(() => {
      if (profile && !initialFormState.username) {
         const initialState = {
            email: session.user.email,
            username: profile.username,
            firstName: profile.firstName,
            lastName: profile.lastName,
            avatar: profile.avatarUrl
         };
         setFormState(initialState);
         setInitialFormState(initialState);
      }
   }, [profile, session, initialFormState.username]);
   
   const isStillLoading = loading || !initialFormState.username;

   const checkUsernameAvailability = async (username, currentUsername) => {
      if (username === currentUsername || username.length < 3) return;

      const { data: isAvailable } = await supabase
         .rpc('check_username_available', { username_to_check: username });

      if (!isAvailable) {
         setFormErrors((prev) => ({
            ...prev,
            username: "This username is already taken"
         }));
      }
   };

   const hasFormChanged = () => {
      return formState.username !== initialFormState.username ||
         formState.firstName !== initialFormState.firstName ||
         formState.lastName !== initialFormState.lastName ||
         pendingAvatarFile !== null;
   };

   const uploadAvatar = async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
         .from('avatars')
         .upload(filePath, file);

      if (uploadError) {
         throw uploadError;
      }

      return filePath;
   };

   const onSubmit = async (event) => {
      event.preventDefault();
      setFormSubmitted(true);
      setIsLoading(true);
      setSuccessMessage("");

      let dataChanged = false;
      let hasError = false;

      try {
         await minLoadingTime(async () => {
            const { error } = ProfileSchema.safeParse(formState);
            if (error) {
               const errors = error.issues.reduce((acc, issue) => {
                  const field = issue.path.join("");
                  const message = acc[field] ? acc[field] + ", " : "";
                  acc[field] = message + issue.message;
                  return acc;
               }, {});
               setFormErrors(errors);
               hasError = true;
               return;
            }

            if (formState.username !== profile.username) {
               const { data: isAvailable, error: checkError } = await supabase
                  .rpc('check_username_available', { username_to_check: formState.username });

               if (checkError) {
                  console.error('Error checking username:', checkError);
                  hasError = true;
                  return;
               }

               if (!isAvailable) {
                  setFormErrors((prev) => ({
                     ...prev,
                     username: "This username is already taken"
                  }));
                  hasError = true;
                  return;
               }
            }

            dataChanged = hasFormChanged();

            const updateData = {
               username: formState.username,
               first_name: formState.firstName,
               last_name: formState.lastName
            };

            if (pendingAvatarFile) {
               try {
                  const filePath = await uploadAvatar(pendingAvatarFile);
                  updateData.avatar_url = filePath;
               } catch (uploadError) {
                  console.error('Error uploading avatar:', uploadError);
                  setFormErrors({ general: "Failed to upload avatar" });
                  hasError = true;
                  return;
               }
            }

            const { success, error: updateError } = await updateProfile(updateData);

            if (!success) {
               setFormErrors({ general: updateError?.message || "Failed to update profile" });
               hasError = true;
               return;
            }

            window.dispatchEvent(new CustomEvent('profileUpdated'));

            setInitialFormState({
               ...formState,
               avatar: updateData.avatar_url || formState.avatar
            });
            setFormErrors({});
            setPendingAvatarFile(null);
            setAvatarPreviewUrl(null);
         });

         if (!hasError) {
            setSuccessMessage(dataChanged ? "updated" : "unchanged");
         }
      } finally {
         setIsLoading(false);
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
         await checkUsernameAvailability(value, profile?.username);
      }
   };

   const setField = (field) => (e) => {
      const value = e.target.value;

      setSuccessMessage("");

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

   const handleAvatarSelect = (event, processedFile) => {
      setPendingAvatarFile(processedFile);
      const previewUrl = URL.createObjectURL(processedFile);
      setAvatarPreviewUrl(previewUrl);
      setSuccessMessage("");
   };

   const contextValue = {
      formState,
      setField,
      onBlur,
      formErrors,
      isInvalid
   };

   const formFields = [
      { name: 'email', type: 'email', disabled: true },
      { name: 'username', type: 'text' },
      {
         type: 'grid',
         fields: [
            { name: 'firstName', type: 'text' },
            { name: 'lastName', type: 'text' }
         ]
      }
   ];

   return (
      <PrivateRoute>
         <LoaderOverlay loading={isStillLoading} />
         <AuthForm
            title="Profile Settings"
            fields={formFields}
            onSubmit={onSubmit}
            isLoading={isLoading}
            contextValue={contextValue}
            successMessage={successMessage}
            showAvatar={true}
            avatarUrl={avatarPreviewUrl || profile?.avatarUrl}
            avatarSize={150}
            avatarPreviewMode={true}
            onAvatarUpload={handleAvatarSelect}
         />
      </PrivateRoute>
   );
};