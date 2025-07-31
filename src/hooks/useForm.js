import { useState } from 'react';

/**
 * Custom hook for handling form state and submission
 * @param {Object} initialValues - Initial form values
 * @param {Function} onSubmit - Function to call on form submission
 * @param {Function} validateForm - Optional validation function
 * @returns {Object} Form controls and state
 */
const useForm = (initialValues = {}, onSubmit = () => {}, validateForm = null) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle different input types
    const inputValue = type === 'checkbox' ? checked : value;
    
    setValues({
      ...values,
      [name]: inputValue
    });
    
    // Clear error for this field when user changes it
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form if validation function provided
    if (validateForm) {
      const validationErrors = validateForm(values);
      setErrors(validationErrors);
      
      // Don't submit if there are validation errors
      if (Object.keys(validationErrors).length > 0) {
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      await onSubmit(values);
      setSubmitted(true);
      
      // Reset form if successful
      // Uncomment if you want to reset form after submission
      // setValues(initialValues);
    } catch (error) {
      console.error('Form submission error:', error);
      // Set submission error if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial values
  const resetForm = () => {
    setValues(initialValues);
    setErrors({});
    setSubmitted(false);
  };

  // Set specific field value programmatically
  const setFieldValue = (field, value) => {
    setValues(prevValues => ({
      ...prevValues,
      [field]: value
    }));
  };

  return {
    values,
    errors,
    isSubmitting,
    submitted,
    handleChange,
    handleSubmit,
    resetForm,
    setFieldValue,
    setErrors,
    setValues
  };
};

export default useForm;
