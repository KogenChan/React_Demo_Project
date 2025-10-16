import { Link } from 'react-router';
import routes from '../routing/routes.min';

export default function Footer() {
   return (
      <div className='text-center text-base-content p-3 bg-base-200'}}>
        © 2025 Copyright:
        <Link className='text-base-content' to={routes.home}>
          John Doe
        </Link>
      </div>
   );
};
