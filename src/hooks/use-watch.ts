import { useEffect, useState } from 'react';
import { FormInstance } from '../components/Form';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UseWatch = (form: FormInstance, namePath: string[]) => any;

export const useWatch: UseWatch = (form, namePath) => {
  const [watchedValue, setWatchedValue] = useState<unknown>();

  useEffect(() => {
    const unsubscribe = form?._subscribe(namePath, (value) => {
      setWatchedValue(value);
    });

    return unsubscribe;
  }, [form, namePath]);

  return watchedValue;
};
