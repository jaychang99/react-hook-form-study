import Form, { FormInstance } from './Form';

interface Props {
  form: FormInstance;
}

const FormUseWatchComponent = ({ form }: Props) => {
  const value = Form.useWatch(form, ['data', 'user', 'name']);
  console.log('FormUseWatchComponent re-rendered');

  return <div>value: {value}</div>;
};

export default FormUseWatchComponent;
