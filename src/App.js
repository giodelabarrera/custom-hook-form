import { useForm } from "./useForm";

function Form({ initialValues }) {
  const formMethods = useForm({ initialValues });
  const {
    errors,
    values,
    touched,
    setFirstnameValue,
    setFirstnameTouched,
    isValid
  } = formMethods;

  return (
    <form onSubmit={() => {}}>
      <div>
        <label htmlFor="firstname">First name</label>
        <input
          onChange={(e) => setFirstnameValue(e.target.value)}
          onBlur={(e) => setFirstnameTouched(true)}
          id="firstname"
          value={values.firstname}
        />
        {errors?.firstname && touched?.firstname && (
          <span style={{ color: "red" }}>{errors.firstname.message}</span>
        )}
      </div>

      <button type="submit" disabled={!isValid}>
        Submit
      </button>

      <pre>{JSON.stringify(formMethods, undefined, 2)}</pre>
    </form>
  );
}

export default function App() {
  const initialValues = {
    firstname: ""
  };

  return (
    <div className="App">
      <Form initialValues={initialValues} />
    </div>
  );
}
