/**
 * Helper to determine the current data source mode.
 * 
 * VITE_DATA_SOURCE can be 'dummy' or 'api'.
 * Default is 'dummy'.
 */

export const isDummyMode = (): boolean => {
  const mode = import.meta.env.VITE_DATA_SOURCE || 'dummy';
  return mode.toLowerCase() === 'dummy';
};

export const isApiMode = (): boolean => {
  return !isDummyMode();
};
