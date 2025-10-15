export default function Button({ content, operation, className }) {
   return (
      <button onClick={operation} className={`btn btn-primary hover:bg-accent hover:border-accent transition-colors duration-200 ease-[cubic-bezier(0.44, 0, 0.56, 1)] h-8 px-3 rounded-4xl ${className}`}>
         <p className="font-medium px-1">{content}</p>
      </button>
   );
};