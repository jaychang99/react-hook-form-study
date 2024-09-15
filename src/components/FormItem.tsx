import {
  Children,
  cloneElement,
  InputHTMLAttributes,
  isValidElement,
  ReactNode,
} from 'react';
import { isInputElement } from '../utils/isElement';
import { useFormInstance } from '../hooks/use-form-instance';

interface FormItemProps {
  name?: string[];
  children?: ReactNode;
}

export const FormItem = ({ name: namePath = [], children }: FormItemProps) => {
  const form = useFormInstance();

  const modifiedChildren = Children.map(children, (child) => {
    if (isValidElement(child)) {
      if (isInputElement(child)) {
        return cloneElement<
          InputHTMLAttributes<HTMLInputElement>,
          HTMLInputElement
        >(child, {
          onChange: (event) => {
            if (!form) {
              return console.warn(
                `No form provider found for ${namePath.join('.')}`,
              );
            }
            if ('value' in event.target) {
              form.setFieldValue(namePath, event.target.value);
            }
          },
        });
      }
    }
    return child; // return non-element children as is
  });

  return <div>{modifiedChildren}</div>;
};
