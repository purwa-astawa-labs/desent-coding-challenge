"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Brand } from "@/components/Brand";
import { useConfigurator } from "@/components/ConfiguratorProvider";
import { SelectionPreviews } from "@/components/WorkspacePreview";
import { formatPrice } from "@/lib/catalog";
import {
  type CheckoutErrors,
  type CheckoutInput,
  hasErrors,
  localDateString,
  parseWeeks,
  validateCheckout,
} from "@/lib/checkout";
import { type LineItem, hasDeskAndChair, lineItems, rentalTotal, weeklyTotal } from "@/lib/configurator";

/** Shared card and button styles for the checkout page. */
const card = "rounded-sheet border border-line bg-raised p-5 shadow-card";
const primaryButton =
  "rounded-full bg-accent px-5 py-3 text-sm font-medium text-accent-contrast shadow-card transition hover:bg-accent/90 hover:shadow-float focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";
const secondaryButton =
  "rounded-control border border-line bg-raised px-5 py-3 text-sm font-medium text-ink transition hover:border-ink/30 hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none";

/** Brand header linking back to the configurator. */
function CheckoutHeader() {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center px-4 pt-4 md:pt-6">
      <Link
        href="/"
        className="rounded-control text-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent md:text-xl"
      >
        <Brand>Design your workspace</Brand>
      </Link>
    </header>
  );
}

const emptyForm: CheckoutInput = { name: "", email: "", startDate: "", weeks: "1" };

interface Confirmation {
  details: CheckoutInput;
  items: LineItem[];
  weekly: number;
  total: number;
  weeks: number;
}

function ItemList({ items }: { items: LineItem[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map(({ key, item }) => (
        <li key={key} className="flex items-center justify-between gap-3 py-2 text-sm">
          <span className="min-w-0">{item.name}</span>
          <span className="shrink-0 tabular-nums text-muted">{formatPrice(item.weeklyPrice)}/week</span>
        </li>
      ))}
    </ul>
  );
}

function Field({
  id,
  label,
  error,
  children,
}: {
  id: keyof CheckoutInput;
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "block w-full min-w-0 rounded-control border border-line bg-raised px-3 py-2 text-base text-ink shadow-card transition focus:border-accent focus:outline-2 focus:outline-accent aria-[invalid=true]:border-danger motion-reduce:transition-none";

export default function CheckoutPage() {
  const { selection, dispatch, hydrated } = useConfigurator();
  const [form, setForm] = useState<CheckoutInput>(emptyForm);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  if (!hydrated) {
    return (
      <>
        <CheckoutHeader />
        <main className="mx-auto w-full max-w-3xl px-4 py-6" aria-busy="true">
          <div className="h-8 w-40 rounded-control bg-line motion-safe:animate-pulse" />
          <div className="mt-6 h-64 rounded-sheet bg-line motion-safe:animate-pulse" />
        </main>
      </>
    );
  }

  const items = lineItems(selection);
  const weekly = weeklyTotal(selection);
  const weeks = parseWeeks(form.weeks);
  const weeksValid = Number.isInteger(weeks) && weeks >= 1;
  const ready = hasDeskAndChair(selection);

  if (confirmation) {
    return (
      <>
      <CheckoutHeader />
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="rounded-sheet border border-accent/30 bg-accent/10 p-5" role="status">
          <h1 className="font-display text-headline text-ink">Rental confirmed</h1>
          <p className="mt-1 text-ink [overflow-wrap:anywhere]">
            Thanks, {confirmation.details.name.trim()}. Your rental starting {confirmation.details.startDate} is confirmed
            for {confirmation.details.email.trim()}.
          </p>
          <p className="mt-1 text-sm text-ink/80">No payment was taken and nothing was sent — this on-screen confirmation is all there is.</p>
        </div>
        <section className={`mt-6 ${card}`}>
          <h2 className="font-display text-title">Your workspace</h2>
          <ItemList items={confirmation.items} />
          <dl className="mt-3 space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt>Weekly total</dt>
              <dd className="font-medium tabular-nums">{formatPrice(confirmation.weekly)}/week</dd>
            </div>
            <div className="flex justify-between">
              <dt>
                Rental total ({confirmation.weeks} week{confirmation.weeks === 1 ? "" : "s"})
              </dt>
              <dd className="font-medium tabular-nums">{formatPrice(confirmation.total)}</dd>
            </div>
          </dl>
        </section>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            onClick={() => dispatch({ type: "reset" })}
            className={primaryButton}
          >
            Start over
          </Link>
          <Link
            href="/"
            className={secondaryButton}
          >
            Back to edit
          </Link>
        </div>
      </main>
      </>
    );
  }

  const update = (field: keyof CheckoutInput) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const found = validateCheckout(form, localDateString());
    setErrors(found);
    if (hasErrors(found)) return;
    // No network call: confirmation is shown on screen only.
    setConfirmation({ details: form, items, weekly, weeks, total: rentalTotal(selection, weeks) });
  };

  const inputProps = (field: keyof CheckoutInput) => ({
    id: field,
    name: field,
    value: form[field],
    onChange: update(field),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: inputClass,
  });

  return (
    <>
    <CheckoutHeader />
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link
        href="/"
        className="rounded-control text-sm font-medium text-muted transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-reduce:transition-none"
      >
        ← Back to edit
      </Link>
      <h1 className="mt-2 font-display text-headline text-ink">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className={`min-w-0 space-y-4 ${card}`}>
          <h2 className="font-display text-title">Your workspace</h2>
          <SelectionPreviews />
          {items.length ? (
            <ItemList items={items} />
          ) : (
            <p className="text-sm text-muted">Nothing selected yet.</p>
          )}
          <div className="flex justify-between border-t border-line pt-3 text-sm">
            <span>Weekly total</span>
            <span className="font-medium tabular-nums">{formatPrice(weekly)}/week</span>
          </div>
        </section>

        <form noValidate onSubmit={onSubmit} className={`min-w-0 space-y-4 ${card}`}>
          <h2 className="font-display text-title">Rental details</h2>
          <Field id="name" label="Name" error={errors.name}>
            <input type="text" autoComplete="name" {...inputProps("name")} />
          </Field>
          <Field id="email" label="Email" error={errors.email}>
            <input type="email" autoComplete="email" inputMode="email" {...inputProps("email")} />
          </Field>
          <Field id="startDate" label="Start date" error={errors.startDate}>
            <input type="date" min={localDateString()} {...inputProps("startDate")} />
          </Field>
          <Field id="weeks" label="Number of weeks" error={errors.weeks}>
            <input type="number" min={1} step={1} inputMode="numeric" {...inputProps("weeks")} />
          </Field>

          <dl className="space-y-1 border-t border-line pt-3 text-sm">
            <div className="flex justify-between">
              <dt>Weekly total</dt>
              <dd className="tabular-nums">{formatPrice(weekly)}/week</dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-medium">Rental total{weeksValid ? ` (${weeks} week${weeks === 1 ? "" : "s"})` : ""}</dt>
              <dd className="font-medium tabular-nums text-accent">{weeksValid ? formatPrice(rentalTotal(selection, weeks)) : "—"}</dd>
            </div>
          </dl>

          {!ready && (
            <p className="rounded-control border border-line bg-surface px-3 py-2 text-sm text-ink" role="status">
              Pick a desk and a chair before confirming.{" "}
              <Link href="/" className="font-medium text-accent underline">
                Choose now
              </Link>
            </p>
          )}
          <button
            type="submit"
            disabled={!ready}
            className={`w-full ${primaryButton} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-accent disabled:hover:shadow-card`}
          >
            Confirm rental
          </button>
          <p className="text-center text-xs text-muted">No payment is taken.</p>
        </form>
      </div>
    </main>
    </>
  );
}
