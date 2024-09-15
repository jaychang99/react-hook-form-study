import {
  FormInstance,
  FormUnsubscribeFunction,
  SubscriptionCallbackFunction,
} from '../components/Form';
import { flattenNamePath, unflattenObject } from '../utils/utils';

type UseForm = () => FormInstance;

export const useForm: UseForm = () => {
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
