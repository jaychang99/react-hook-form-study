import Form from './Form';
import type { FormProps } from './Form';
import FormUseWatchComponent from './FormUseWatchComponent';

const USER_NAME_NAME_PATH = ['data', 'user', 'name'];
const USER_AGE_NAME_PATH = ['data', 'user', 'age'];

const FormExample = () => {
  const handleFinish: FormProps['onFinish'] = (values) => {
    console.log('handleFinish ->', values);
  };

  const form = Form.useForm();

  return (
    <Form onFinish={handleFinish} form={form}>
      <Form.Item name={USER_NAME_NAME_PATH}>
        <input />
      </Form.Item>
      <Form.Item name={USER_AGE_NAME_PATH}>
        <input />
      </Form.Item>
      <button
        onClick={() => {
          console.log('---', form.getFieldsValue());
        }}
      >
        Get Fields Value!
      </button>
      <button
        onClick={() => {
          console.log('---', form.getFieldValue(USER_NAME_NAME_PATH));
        }}
      >
        Get Field Value!
      </button>
      <FormUseWatchComponent form={form} />
      {/* <p>value: {JSON.stringify(form.getFieldValue(USER_NAME_NAME_PATH))}</p> */}
      {/* <p>useWatch value: {JSON.stringify(liveName)}</p> */}
      <button type="submit">Submit!</button>
    </Form>
  );
};

export default FormExample;
