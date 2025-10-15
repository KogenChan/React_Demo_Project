import { CSSTransition } from 'react-transition-group';
import { useRef } from 'react';
import '../styles/loaderOverlay.min.css'

export default function LoaderOverlay({ loading }) {
   const nodeRef = useRef(null);

   return (
      <CSSTransition
         in={loading}
         timeout={300}
         classNames="loader-fade"
         unmountOnExit
         nodeRef={nodeRef} // ✅ pass the ref
      >
         <div ref={nodeRef} className="loader-overlay">
            <div className="loader scale-200 pb-20" />
         </div>
      </CSSTransition>
   );
};