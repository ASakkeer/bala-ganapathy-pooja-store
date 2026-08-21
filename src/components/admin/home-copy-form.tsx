"use client";

import { useState } from "react";
import { useRouter } from "@/components/progress/navigation";
import { useActionProgress } from "@/components/progress/use-action-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HOME_RITUAL_TILES } from "@/content/home-rituals";
import type { HomeContent } from "@/content/home-content";

const areaClassName =
  "min-h-24 w-full rounded-2xl bg-brand/[0.04] px-4 py-3 text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30";

export function HomeCopyForm({ content }: { content: HomeContent }) {
  const router = useRouter();
  const progress = useActionProgress();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [heroEyebrow, setHeroEyebrow] = useState(content.heroEyebrow);
  const [heroTitle, setHeroTitle] = useState(content.heroTitle);
  const [heroSubtitle, setHeroSubtitle] = useState(content.heroSubtitle);
  const [heroCta, setHeroCta] = useState(content.heroCta);
  const [ritualEyebrow, setRitualEyebrow] = useState(content.ritualEyebrow);
  const [ritualTitle, setRitualTitle] = useState(content.ritualTitle);
  const [ritualCta, setRitualCta] = useState(content.ritualCta);
  const [ritualTiles, setRitualTiles] = useState(content.ritualTiles);
  const [popularEyebrow, setPopularEyebrow] = useState(content.popularEyebrow);
  const [popularTitle, setPopularTitle] = useState(content.popularTitle);
  const [popularBody, setPopularBody] = useState(content.popularBody);
  const [popularCta, setPopularCta] = useState(content.popularCta);
  const [trust, setTrust] = useState(content.trust);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError("");
    progress.begin();
    try {
      const response = await fetch("/api/admin/home/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          heroEyebrow,
          heroTitle,
          heroSubtitle,
          heroCta,
          ritualEyebrow,
          ritualTitle,
          ritualCta,
          ritualTiles,
          popularEyebrow,
          popularTitle,
          popularBody,
          popularCta,
          trust,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Could not save the home page text.");
      }
      progress.succeed("Home page text saved.");
      router.refresh();
    } catch (saveError) {
      const message =
        saveError instanceof Error ? saveError.message : "Could not save the home page text.";
      setError(message);
      progress.fail(message);
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={(event) => void save(event)} className="flex flex-col gap-8">
      <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
        <h2 className="font-serif text-2xl font-medium tracking-tight">Banner text</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          This sits on top of the home banner image.
        </p>
        <div className="mt-5 grid gap-4">
          <div>
            <Label htmlFor="hero-eyebrow">Small line</Label>
            <Input id="hero-eyebrow" value={heroEyebrow} onChange={(event) => setHeroEyebrow(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="hero-title">Headline</Label>
            <Input id="hero-title" value={heroTitle} onChange={(event) => setHeroTitle(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="hero-subtitle">Supporting line</Label>
            <textarea
              id="hero-subtitle"
              className={areaClassName}
              value={heroSubtitle}
              onChange={(event) => setHeroSubtitle(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="hero-cta">Button</Label>
            <Input id="hero-cta" value={heroCta} onChange={(event) => setHeroCta(event.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
        <h2 className="font-serif text-2xl font-medium tracking-tight">Shop by ritual text</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Headings for the five-tile grid, plus the title and subtitle on each tile.
        </p>
        <div className="mt-5 grid gap-4">
          <div>
            <Label htmlFor="ritual-eyebrow">Small line</Label>
            <Input
              id="ritual-eyebrow"
              value={ritualEyebrow}
              onChange={(event) => setRitualEyebrow(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="ritual-title">Section title</Label>
            <Input id="ritual-title" value={ritualTitle} onChange={(event) => setRitualTitle(event.target.value)} />
          </div>
          <div>
            <Label htmlFor="ritual-cta">Link</Label>
            <Input id="ritual-cta" value={ritualCta} onChange={(event) => setRitualCta(event.target.value)} />
          </div>
        </div>
        <ul className="mt-6 grid gap-4">
          {HOME_RITUAL_TILES.map((tile) => (
            <li key={tile.slug} className="grid gap-3 rounded-home bg-brand/[0.03] p-4 sm:grid-cols-2">
              <p className="sm:col-span-2 text-sm font-medium text-text">
                {tile.featured ? `${tile.name} (large tile)` : tile.name}
              </p>
              <div>
                <Label htmlFor={`tile-title-${tile.slug}`}>Tile title</Label>
                <Input
                  id={`tile-title-${tile.slug}`}
                  value={ritualTiles[tile.slug].title}
                  onChange={(event) =>
                    setRitualTiles((current) => ({
                      ...current,
                      [tile.slug]: { ...current[tile.slug], title: event.target.value },
                    }))
                  }
                />
              </div>
              <div>
                <Label htmlFor={`tile-subtitle-${tile.slug}`}>Tile subtitle</Label>
                <Input
                  id={`tile-subtitle-${tile.slug}`}
                  value={ritualTiles[tile.slug].subtitle}
                  onChange={(event) =>
                    setRitualTiles((current) => ({
                      ...current,
                      [tile.slug]: { ...current[tile.slug], subtitle: event.target.value },
                    }))
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
        <h2 className="font-serif text-2xl font-medium tracking-tight">Most loved products text</h2>
        <div className="mt-5 grid gap-4">
          <div>
            <Label htmlFor="popular-eyebrow">Small line</Label>
            <Input
              id="popular-eyebrow"
              value={popularEyebrow}
              onChange={(event) => setPopularEyebrow(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="popular-title">Section title</Label>
            <Input
              id="popular-title"
              value={popularTitle}
              onChange={(event) => setPopularTitle(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="popular-body">Description</Label>
            <textarea
              id="popular-body"
              className={areaClassName}
              value={popularBody}
              onChange={(event) => setPopularBody(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="popular-cta">Link</Label>
            <Input id="popular-cta" value={popularCta} onChange={(event) => setPopularCta(event.target.value)} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl bg-surface p-5 ring-1 ring-border/80 sm:p-6">
        <h2 className="font-serif text-2xl font-medium tracking-tight">Why shop with us</h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Three cards at the bottom of the home page. Icons stay the same.
        </p>
        <ul className="mt-5 grid gap-4">
          {trust.map((item, index) => (
            <li key={index} className="grid gap-3 rounded-home bg-brand/[0.03] p-4">
              <p className="text-sm font-medium text-text">Card {index + 1}</p>
              <div>
                <Label htmlFor={`trust-title-${index}`}>Title</Label>
                <Input
                  id={`trust-title-${index}`}
                  value={item.title}
                  onChange={(event) =>
                    setTrust((current) => {
                      const next = [...current] as HomeContent["trust"];
                      next[index] = { ...next[index], title: event.target.value };
                      return next;
                    })
                  }
                />
              </div>
              <div>
                <Label htmlFor={`trust-body-${index}`}>Text</Label>
                <textarea
                  id={`trust-body-${index}`}
                  className={areaClassName}
                  value={item.body}
                  onChange={(event) =>
                    setTrust((current) => {
                      const next = [...current] as HomeContent["trust"];
                      next[index] = { ...next[index], body: event.target.value };
                      return next;
                    })
                  }
                />
              </div>
            </li>
          ))}
        </ul>
      </section>

      {error ? <p className="text-sm text-danger">{error}</p> : null}
      <Button type="submit" disabled={pending || progress.pending} className="w-fit">
        {pending ? "Saving…" : "Save home text"}
      </Button>
    </form>
  );
}
