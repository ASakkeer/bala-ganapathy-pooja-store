"use client";

import { useId, useState } from "react";
import { PinInput } from "@/components/auth/pin-input";
import { Button } from "@/components/ui/button";
import { confirmPinError, PIN_LENGTH, pinError } from "@/lib/pin";

function emptyPin() {
  return Array(PIN_LENGTH).fill("");
}

export function PinSetupStep({
  pending,
  error,
  onBack,
  onSubmit,
}: {
  pending: boolean;
  error: string;
  onBack: () => void;
  onSubmit: (pin: string, confirmPin: string) => void;
}) {
  const pinId = useId();
  const [phase, setPhase] = useState<"create" | "confirm">("create");
  const [round, setRound] = useState(0);
  const [pin, setPin] = useState<string[]>(emptyPin());
  const [confirm, setConfirm] = useState<string[]>(emptyPin());
  const [localError, setLocalError] = useState("");

  const pinValue = pin.join("");
  const confirmValue = confirm.join("");
  const isConfirm = phase === "confirm";
  const current = isConfirm ? confirm : pin;
  const setCurrent = isConfirm ? setConfirm : setPin;

  function restartCreate(message: string) {
    setLocalError(message);
    setPin(emptyPin());
    setConfirm(emptyPin());
    setPhase("create");
    setRound((value) => value + 1);
  }

  function goToConfirm(value: string) {
    const message = pinError(value);
    if (message) {
      restartCreate(message);
      return;
    }

    setLocalError("");
    setConfirm(emptyPin());
    setPhase("confirm");
    setRound((value) => value + 1);
  }

  function finish(nextConfirm = confirmValue) {
    const message = confirmPinError(pinValue, nextConfirm);
    if (message) {
      restartCreate("Those PINs do not match. Enter your PIN again, then re-enter it.");
      return;
    }

    setLocalError("");
    onSubmit(pinValue, nextConfirm);
  }

  return (
    <form
      className="flex flex-col gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        if (isConfirm) {
          finish();
        } else {
          goToConfirm(pinValue);
        }
      }}
    >
      <div>
        <p className="text-xs tracking-[0.18em] uppercase text-muted">Step 2 of 2</p>
        <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight">
          {isConfirm ? "Confirm your PIN" : "Create your PIN"}
        </h2>
        <p className="mt-3 text-base leading-relaxed text-muted">
          {isConfirm
            ? "Type the same four digits again so we know it was not a slip."
            : "Choose four digits you will remember. This is how you sign in next time — there is no password and no SMS code."}
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <label htmlFor={pinId} className="text-center text-sm font-medium text-text">
          {isConfirm ? "Re-enter PIN" : "Enter PIN"}
        </label>
        <PinInput
          id={pinId}
          key={`${phase}-${round}`}
          digits={current}
          disabled={pending}
          autoComplete="new-password"
          onChange={(next) => {
            setCurrent(next);
            if (localError) {
              setLocalError("");
            }
            const joined = next.join("");
            if (joined.length !== PIN_LENGTH) {
              return;
            }
            if (isConfirm) {
              finish(joined);
            } else {
              goToConfirm(joined);
            }
          }}
        />
        {!isConfirm ? (
          <p className="text-center text-sm leading-relaxed text-muted">
            Avoid obvious choices such as 1234 or 1111.
          </p>
        ) : null}
      </div>

      {localError || error ? (
        <p className="text-center text-sm text-danger">{localError || error}</p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          disabled={
            pending || (isConfirm ? confirmValue.length !== PIN_LENGTH : pinValue.length !== PIN_LENGTH)
          }
          className="h-12 w-full text-base"
        >
          {pending ? "Saving PIN…" : isConfirm ? "Save PIN and continue" : "Continue"}
        </Button>
        <button
          type="button"
          className="min-h-11 text-sm text-muted hover:text-brand"
          disabled={pending}
          onClick={() => {
            if (isConfirm) {
              restartCreate("");
              return;
            }
            onBack();
          }}
        >
          {isConfirm ? "Use a different PIN" : "Back to your details"}
        </button>
      </div>
    </form>
  );
}
