import Button from "./button";
import FloatingInput from "./floatingInput";
import Avatar from "./avatar";
import { FormProvider } from "../context/FormContext";
import { Link } from "react-router";

export default function AuthForm({
   title,
   fields,
   onSubmit,
   isLoading,
   contextValue,
   successMessage = "",
   showAvatar = false,
   avatarUrl = null,
   avatarPreviewMode = false,
   onAvatarUpload = null,
   link = null
}) {
   const getSuccessMessageText = () => {
      if (successMessage === "updated") {
         return "Profile updated successfully!";
      }
      if (successMessage === "unchanged") {
         return "Profile information unchanged";
      }
      return "";
   };

   return (
      <main className="flex justify-center">
         <div className="min-h-screen container flex justify-center content-center flex-wrap">
            <FormProvider value={contextValue}>
               <form onSubmit={onSubmit} noValidate className="lg:bg-base-200 p-6 rounded-sm w-full sm:w-[80%] lg:w-1/2">
                  <h1 className="text-3xl md:text-4xl text-accent pb-8">{title}</h1>

                  {showAvatar && (
                     <>
                        {/* Avatar on small screens - below title */}
                        <div className="md:hidden flex justify-center mb-6">
                           <Avatar
                              url={avatarUrl}
                              onUpload={onAvatarUpload}
                              previewMode={avatarPreviewMode}
                           />
                        </div>

                        {/* Avatar on medium+ screens - left side */}
                        <div className="hidden md:flex md:gap-6">
                           <div className="flex-shrink-0">
                              <Avatar
                                 url={avatarUrl}
                                 onUpload={onAvatarUpload}
                                 previewMode={avatarPreviewMode}
                              />
                           </div>
                           <div className="flex-grow">
                              {fields.map((field, index) => {
                                 if (field.type === 'grid') {
                                    return (
                                       <div key={index} className="grid grid-cols-2 gap-6">
                                          {field.fields.map((gridField) => (
                                             <FloatingInput
                                                key={gridField.name}
                                                field={gridField.name}
                                                type={gridField.type}
                                                disabled={gridField.disabled}
                                             />
                                          ))}
                                       </div>
                                    );
                                 }
                                 return (
                                    <FloatingInput
                                       key={field.name}
                                       field={field.name}
                                       type={field.type}
                                       disabled={field.disabled}
                                    />
                                 );
                              })}
                           </div>
                        </div>
                     </>
                  )}

                  {/* Fields for small screens when avatar is shown, or all screens when no avatar */}
                  <div className={showAvatar ? "md:hidden" : ""}>
                     {fields.map((field, index) => {
                        if (field.type === 'grid') {
                           return (
                              <div key={index} className="grid grid-cols-2 gap-6">
                                 {field.fields.map((gridField) => (
                                    <FloatingInput
                                       key={gridField.name}
                                       field={gridField.name}
                                       type={gridField.type}
                                       disabled={gridField.disabled}
                                    />
                                 ))}
                              </div>
                           );
                        }
                        return (
                           <FloatingInput
                              key={field.name}
                              field={field.name}
                              type={field.type}
                              disabled={field.disabled}
                           />
                        );
                     })}
                  </div>

                  <div className="flex justify-between items-center pt-1">
                     {link && (
                        <Link
                           to={link.href}
                           className="text-xs text-primary hover:underline"
                        >
                           {link.label}
                        </Link>
                     )}
                     {successMessage && (
                        <span className="text-success text-sm">
                           {getSuccessMessageText()}
                        </span>
                     )}
                     <div className="ml-auto flex items-center">
                        {isLoading ? (
                           <div className="loader" />
                        ) : (
                           <Button content="Submit" />
                        )}
                     </div>
                  </div>
               </form>
            </FormProvider>
         </div>
      </main>
   );
};