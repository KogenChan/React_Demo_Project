import { useFormContext } from "../context/FormContext";

export default function FloatingInput({ field, type = "text", required = true, disabled = false }) {
   const { formState, setField, onBlur, formErrors, isInvalid } = useFormContext();

   const getLabel = (fieldName) => {
      return fieldName
         .replace(/([A-Z])/g, ' $1')
         .replace(/_/g, ' ')
         .replace(/^./, str => str.toUpperCase())
         .trim();
   };

   const fieldId = `floating_${field}`;
   const label = getLabel(field);

   return (
      <div className="relative z-0 w-full mb-5 group">
         <input
            type={type}
            name={fieldId}
            id={fieldId}
            className={`block py-2.5 px-0 w-full text-sm text-base-content bg-transparent border-b-2 appearance-none focus:outline-none focus:ring-0 focus:border-primary peer ${
               disabled ? 'opacity-60 cursor-not-allowed' : ''
            }`}
            placeholder=" "
            value={formState[field]}
            onChange={setField(field)}
            onBlur={onBlur(field)}
            aria-invalid={isInvalid(field)}
            required={required}
            disabled={disabled}
         />
         <label 
            htmlFor={fieldId}
            className="peer-focus:font-medium absolute text-sm text-base-content duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-primary peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
         >
            {label}
         </label>
         {formErrors[field] && <small className="text-error text-xs mt-1 block">{formErrors[field]}</small>}
      </div>
   );
};