import { createContext, FormEventHandler, ReactNode } from 'react';
import { useForm } from '../hooks/use-form';
import { useWatch } from '../hooks/use-watch';
import { FormItem } from './FormItem';

export interface FormInstance {
  getFieldsValue: () => unknown;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getFieldValue: (namePath: string[]) => any;
  setFieldValue: (namePath: string[], value: unknown) => void;
  _subscribe: FormSubscribeFunction;
}

type FormSubscribeFunction = (
  namePath: string[],
  callback: SubscriptionCallbackFunction,
) => FormUnsubscribeFunction;
export type FormUnsubscribeFunction = () => void;
export type SubscriptionCallbackFunction = (value: unknown) => void;

export interface FormProps {
  form?: FormInstance;
  children?: ReactNode;
  onFinish?: (values: unknown) => void;
}

export const FormContext = createContext<FormInstance | null | undefined>(null);

const Form = ({ form, children, onFinish }: FormProps) => {
  const onSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();

    if (!form) {
      console.warn('Form is not connected to any form instances');
      return;
    }

    onFinish?.(form.getFieldsValue());
  };

  return (
    <FormContext.Provider value={form}>
      <form onSubmit={onSubmit}>{children}</form>
    </FormContext.Provider>
  );
};

Form.Item = FormItem;
Form.useForm = useForm;
Form.useWatch = useWatch;

export default Form;
