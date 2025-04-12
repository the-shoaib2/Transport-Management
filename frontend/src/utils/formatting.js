const formatCurrency = (amount) => {
  return `৳${parseFloat(amount).toLocaleString('bn-BD')}`;
};

export { formatCurrency }; 