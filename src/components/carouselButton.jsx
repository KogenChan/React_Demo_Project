import { BiChevronsLeft } from 'react-icons/bi';
import { BiChevronsRight } from 'react-icons/bi';

export default function CarouselButton({ direction, operation}) {
   const scroll = (direction === `left` ? -1 : 1);
   return (
      <button
         onClick={() => operation(scroll)}
         className={`btn btn-circle absolute top-[44%] ${direction === 'left' ? 'left-2' : 'right-2'} z-10 bg-base-200 border-0 xl:hidden text-5xl`}
      >
         {direction === `left` ? <BiChevronsLeft className='me-1' /> : <BiChevronsRight className='ms-1' />}
      </button>
   );
};