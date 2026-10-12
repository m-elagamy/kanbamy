const hasErrors = (errors?: Record<string, string> | null): boolean => {
  if (!errors) return false;
  return Object.values(errors).some(Boolean);
};

export default hasErrors;
