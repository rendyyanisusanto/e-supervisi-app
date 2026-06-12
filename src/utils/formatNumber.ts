export const formatNumber = (num: number, digits = 2): string => {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(num);
};
