export const setLocalSession = (uniqueContext, data) => {
  Object.keys(data).forEach((key) => {
    sessionStorage.setItem(`${uniqueContext}_${key}`, data[key]);
  });
};
