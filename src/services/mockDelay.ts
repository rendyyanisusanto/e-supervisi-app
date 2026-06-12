export const mockDelay = (min = 300, max = 800): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1) + min);
  return new Promise(resolve => setTimeout(resolve, delay));
};
