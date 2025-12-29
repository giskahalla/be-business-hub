
export const generateId = (source, code) => {
  if (source.length === 0) return `${code}001`;

  const maxNumber = source.reduce((max, c) => {
    const num = parseInt(c.id.replace(code, ""), 10);
    return num > max ? num : max;
  }, 0);

  return `${code}${String(maxNumber + 1).padStart(3, "0")}`;
}