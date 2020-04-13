import { useEffect } from 'react';

const noDocumentBody = { style: { overflow: '' } };
const body =
  typeof document !== 'undefined'
    ? document.querySelector('body')
    : noDocumentBody;

const useBodyScrollLock = (isLocked) => {
  useEffect(() => {
    if (isLocked) {
      body.style.overflow = 'hidden';
    }
    if (!isLocked) {
      body.style.overflow = '';
    }
    return () => {
      body.style.overflow = '';
    };
  }, [isLocked]);
};

export default useBodyScrollLock;
