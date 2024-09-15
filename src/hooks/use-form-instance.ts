import { useContext } from 'react';
import { FormContext, FormInstance } from '../components/Form';

type UseFormInstance = () => FormInstance | undefined | null;

export const useFormInstance: UseFormInstance = () => {
  const form = useContext(FormContext);

  return form;
};
