export const PIN_LENGTH = 4;

const REPEATED = new Set(
  Array.from({ length: 10 }, (_, digit) => String(digit).repeat(PIN_LENGTH)),
);

export function digitsOnlyPinInput(raw: string) {
  return raw.replace(/\D/g, "").slice(0, PIN_LENGTH);
}

export function isPinShape(value: string) {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(value);
}

function isSequential(value: string) {
  const digits = [...value].map((char) => Number(char));
  const step = digits[1]! - digits[0]!;
  if (step !== 1 && step !== -1) {
    return false;
  }

  return digits.every((digit, index) => index === 0 || digit - digits[index - 1]! === step);
}

export function pinError(value: string): string | null {
  const pin = digitsOnlyPinInput(value);

  if (!isPinShape(pin)) {
    return `Enter a ${PIN_LENGTH}-digit PIN.`;
  }

  if (REPEATED.has(pin) || isSequential(pin) || pin === "2580") {
    return "Choose a less obvious PIN. Avoid repeats like 1111 or sequences like 1234.";
  }

  return null;
}

export function confirmPinError(pin: string, confirm: string): string | null {
  const first = pinError(pin);
  if (first) {
    return first;
  }

  if (digitsOnlyPinInput(confirm) !== digitsOnlyPinInput(pin)) {
    return "Those PINs do not match.";
  }

  return null;
}
