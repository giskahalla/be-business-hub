
export const generateCustomerId = (customers) => {
  if (customers.length === 0) return "CUS001";

  const maxNumber = customers.reduce((max, c) => {
    const num = parseInt(c.id.replace("CUS", ""), 10);
    return num > max ? num : max;
  }, 0);

  return `CUS${String(maxNumber + 1).padStart(3, "0")}`;
}