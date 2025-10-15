import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css'
import defaultImg from '../assets/media/default.png'

export default function LazyLoadGameImage({image, className}) {
   return (
      <LazyLoadImage
         alt='game image'
         effect='blur'
         wrapperProps={{
            style: {transitionDelay: '0.2s'}
         }}
         src={image || defaultImg}
         className={`w-full h-full object-cover ${className}`}
      />
   );
};