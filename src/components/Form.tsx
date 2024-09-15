import {
  Children,
  cloneElement,
  createContext,
  FormEventHandler,
  InputHTMLAttributes,
  isValidElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { flattenNamePath, unflattenObject } from '../utils/utils';
import { isInputElement } from '../utils/isElement';

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
type FormUnsubscribeFunction = () => void;
type SubscriptionCallbackFunction = (value: unknown) => void;

export interface FormProps {
  form?: FormInstance;
  children?: ReactNode;
  onFinish?: (values: unknown) => void;
}

const FormContext = createContext<FormInstance | null | undefined>(null);

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

interface FormItemProps {
  name?: string[];
  children?: ReactNode;
}

const FormItem = ({ name: namePath = [], children }: FormItemProps) => {
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

type UseForm = () => FormInstance;

const useForm: UseForm = () => {
  const listeners: Record<
    string,
    { subscriptionId: number; callback: SubscriptionCallbackFunction }[]
  > = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formDataObj: Record<string, any> = new Proxy(
    {},
    {
      set(target, property, newValue) {
        // @ts-expect-error temporary bypass
        target[property] = newValue;

        listeners[property as string]?.forEach((listener) => {
          listener.callback(newValue);
        });

        return true;
      },
    },
  );

  const getFieldsValue: FormInstance['getFieldsValue'] = () => {
    const plainFormDataObject = JSON.parse(JSON.stringify(formDataObj));
    return unflattenObject(plainFormDataObject);
  };

  const getFieldValue: FormInstance['getFieldValue'] = (namePath) => {
    return formDataObj[flattenNamePath(namePath)];
  };

  const setFieldValue: FormInstance['setFieldValue'] = (namePath, value) => {
    formDataObj[flattenNamePath(namePath)] = value;
  };

  const _subscribe: FormInstance['_subscribe'] = (namePath, callback) => {
    const namePathInDotNotation = namePath.join('.');
    const subscriptionId = new Date().getTime();

    if (!listeners[namePathInDotNotation]) {
      listeners[namePathInDotNotation] = [];
    }

    listeners[namePathInDotNotation].push({
      subscriptionId,
      callback,
    });

    // TODO: come up with a better way to unsubscribe
    const unsubscribe: FormUnsubscribeFunction = () => {
      listeners[namePathInDotNotation] = listeners[
        namePathInDotNotation
      ].filter((listener) => listener.subscriptionId !== subscriptionId);
    };

    return unsubscribe;
  };

  const form: FormInstance = {
    getFieldsValue,
    getFieldValue,
    setFieldValue,
    _subscribe,
  };

  return form;
};

type UseFormInstance = () => FormInstance | undefined | null;

const useFormInstance: UseFormInstance = () => {
  const form = useContext(FormContext);

  return form;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type UseWatch = (form: FormInstance, namePath: string[]) => any;

const useWatch: UseWatch = (form, namePath) => {
  const [watchedValue, setWatchedValue] = useState<unknown>();

  useEffect(() => {
    const unsubscribe = form?._subscribe(namePath, (value) => {
      setWatchedValue(value);
    });

    return unsubscribe;
  }, [form, namePath]);

  return watchedValue;
};

Form.Item = FormItem;
Form.useForm = useForm;
Form.useWatch = useWatch;

export default Form;
