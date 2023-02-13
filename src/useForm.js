import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import * as yup from "yup";
import { dequal } from "dequal/lite";

function formReducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case "SET_ISVALIDATING":
      return { ...state, isValidating: payload };
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

function valuesReducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case "SET_FIRSTNAME_VALUE": {
      return {
        ...state,
        firstname: payload
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

function errorsReducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case "SET_ERRORS": {
      return {
        ...payload
      };
    }
    case "SET_FIRSTNAME_ERROR": {
      return {
        ...state,
        firstname: payload
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

function touchedReducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case "SET_TOUCHED": {
      return {
        ...payload
      };
    }
    case "SET_FIRSTNAME_TOUCHED": {
      return {
        ...state,
        firstname: payload
      };
    }
    default: {
      throw Error("Unknown action: " + action.type);
    }
  }
}

export function createFirstnameSchema() {
  return yup
    .string()
    .min(2, "Debe ser mayor a 2 caracteres")
    .max(5, "No debe ser mayor a 5 caracteres")
    .required("Este valor es requerido");
}

function getFirstnameErrors(value) {
  const firstnameSchema = createFirstnameSchema();
  try {
    firstnameSchema.validateSync(value);
    return undefined;
  } catch (yupError) {
    const { type, message } = yupError;
    return { type, message };
  }
}

function runAllValidations(values) {
  const { firstname } = values;
  const firstnameErrors = getFirstnameErrors(firstname);

  const combinedErrors = {
    ...(firstnameErrors && { firstname: firstnameErrors })
  };
  return combinedErrors;
}

export function useForm({ initialValues, initialErrors, initialTouched }) {
  const initialValuesRef = useRef(initialValues);
  const initialErrorsRef = useRef(initialErrors || {});
  const initialTouchedRef = useRef(initialTouched || {});
  const isMounted = useRef(false);

  const [formState, formDispatch] = useReducer(formReducer, {
    isValidating: false
  });
  const [values, valuesDispatch] = useReducer(valuesReducer, initialValues);
  const [errors, errorsDispatch] = useReducer(errorsReducer, {});
  const [touched, touchedDispatch] = useReducer(touchedReducer, {});

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const validateForm = useCallback((values) => {
    formDispatch({ type: "SET_ISVALIDATING", payload: true });
    const currentErrors = runAllValidations(values);
    if (Boolean(isMounted.current)) {
      formDispatch({ type: "SET_ISVALIDATING", payload: false });
      errorsDispatch({ type: "SET_ERRORS", payload: currentErrors });
    }
    return currentErrors;
  }, []);

  useEffect(() => {
    console.log("side effects");
    validateForm(values);
  }, [values, validateForm, touched]);

  const setFirstnameValue = useCallback((value) => {
    valuesDispatch({ type: "SET_FIRSTNAME_VALUE", payload: value });
  }, []);

  const setFirstnameTouched = useCallback((touchedValue = true) => {
    touchedDispatch({ type: "SET_FIRSTNAME_TOUCHED", payload: touchedValue });
  }, []);

  const isDirty = useMemo(() => !dequal(initialValuesRef.current, values), [
    values
  ]);

  const isValid = useMemo(() => Object.keys(errors).length === 0, [errors]);

  return {
    initialValues: initialValuesRef.current,
    initialErrors: initialErrorsRef.current,
    initialTouched: initialTouchedRef.current,
    values,
    setFirstnameValue,
    touched,
    setFirstnameTouched,
    errors,
    isValidating: formState.isValidating,
    isValid,
    isDirty
  };
}
