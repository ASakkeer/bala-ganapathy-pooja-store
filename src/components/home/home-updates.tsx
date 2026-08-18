"use client";

import { useState } from "react";
import Link from "next/link";
import { FullBleed } from "@/components/ui/full-bleed";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HomeUpdates({ whatsappHref }: { whatsappHref?: string | null }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = email.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Enter a valid email address.");
      return;
    }

    setError("");
    setDone(true);
  }

  return (
    <FullBleed className="bg-brand text-on-brand">
      <Container>
        <section className="grid gap-8 py-14 md:grid-cols-[minmax(0,1fr)_minmax(16rem,24rem)] md:items-center md:py-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(18rem,26rem)]">
          <div>
            <p className="text-[0.7rem] font-medium tracking-[0.18em] uppercase text-accent">
              Restocks & festivals
            </p>
            <h2 className="mt-3 font-serif text-3xl font-medium tracking-tight md:text-4xl">
              Notes from the shop
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-on-brand/80 md:text-base">
              Festival lists, new packs, and restocks — when the shop turns email updates on. Until
              then, Contact or WhatsApp is the fastest way to reach the counter.
            </p>
          </div>

          {done ? (
            <p className="text-sm leading-relaxed text-on-brand/90" role="status">
              Noted. Email updates are not sending yet. Use{" "}
              <Link href="/contact" className="underline decoration-on-brand/40 underline-offset-4">
                Contact
              </Link>
              {whatsappHref ? (
                <>
                  {" "}
                  or{" "}
                  <a
                    href={whatsappHref}
                    className="underline decoration-on-brand/40 underline-offset-4"
                  >
                    WhatsApp
                  </a>
                </>
              ) : null}{" "}
              to reach the shop.
            </p>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <label htmlFor="home-updates-email" className="sr-only">
                Email for shop updates
              </label>
              <Input
                id="home-updates-email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                error={error}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                className="bg-on-brand text-text placeholder:text-muted"
              />
              <Button type="submit" variant="inverse" className="w-full sm:w-auto">
                Keep me posted
              </Button>
            </form>
          )}
        </section>
      </Container>
    </FullBleed>
  );
}
