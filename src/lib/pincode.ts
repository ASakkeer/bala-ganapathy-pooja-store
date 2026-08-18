export function isIndianPincode(value: string) {
  return /^\d{6}$/.test(value);
}
