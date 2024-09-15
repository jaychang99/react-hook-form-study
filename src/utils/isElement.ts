import {
  DOMElement,
  InputHTMLAttributes,
  isValidElement,
  ReactNode,
} from 'react';

export const isInputElement = (
  child: ReactNode,
): child is DOMElement<
  InputHTMLAttributes<HTMLInputElement>,
  HTMLInputElement
> => {
  return isValidElement(child) && child.type === 'input';
};
