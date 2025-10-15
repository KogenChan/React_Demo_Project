import z from "zod";

const passwordRegex = /(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/;
const passwordError =
   "Password must contain at least one uppercase letter, one lowercase letter, and one number.";

export const FormSchema = z.object({
   email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
   firstName: z.string().min(1, "First name is required"),
   lastName: z.string().min(1, "Last name is required"),
   username: z.string().min(3, "Username must be at least 3 characters long"),
   password: z.string()
      .min(8, "Password must be at least 8 characters long")
      .regex(passwordRegex, passwordError),
   repeat_password: z.string().min(1, "Please confirm your password")
});

export const ConfirmSchema = FormSchema.refine(
   (data) => data.password === data.repeat_password,
   {
      message: "Passwords do not match",
      path: ["repeat_password"]
   }
);

export function getFieldError(property, value) {
   const { error } = FormSchema.shape[property].safeParse(value);
   return error
      ? error.issues.map((issue) => issue.message).join(", ")
      : undefined;
}

export const getErrors = (error) =>
   error.issues.reduce((all, issue) => {
      const path = issue.path.join("");
      const message = all[path] ? all[path] + ", " : "";
      all[path] = message + issue.message;
      return all;
   }, {});