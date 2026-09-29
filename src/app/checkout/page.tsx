"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useConfigurator } from "@/components/ConfiguratorProvider";
import { WorkspacePreview } from "@/components/WorkspacePreview";
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
    <ul className="divide-y divide-stone-200">
      {items.map(({ key, item }) => (
        <li key={key} className="flex items-center justify-between gap-3 py-2 text-sm">
          <span className="min-w-0">{item.name}</span>
          <span className="shrink-0 tabular-nums text-stone-700">{formatPrice(item.weeklyPrice)}/week</span>
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
      <label htmlFor={id} className="block text-sm font-medium text-stone-900">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "block w-full min-w-0 rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 focus:border-stone-900 focus:outline-2 focus:outline-stone-900 aria-[invalid=true]:border-red-600";

export default function CheckoutPage() {
  const { selection, dispatch, hydrated } = useConfigurator();
  const [form, setForm] = useState<CheckoutInput>(emptyForm);
  const [errors, setErrors] = useState<CheckoutErrors>({});
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);

  if (!hydrated) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6" aria-busy="true">
        <div className="h-8 w-40 animate-pulse rounded bg-stone-200" />
        <div className="mt-6 h-64 animate-pulse rounded-2xl bg-stone-200" />
      </main>
    );
  }

  const items = lineItems(selection);
  const weekly = weeklyTotal(selection);
  const weeks = parseWeeks(form.weeks);
  const weeksValid = Number.isInteger(weeks) && weeks >= 1;
  const ready = hasDeskAndChair(selection);

  if (confirmation) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5" role="status">
          <h1 className="text-2xl font-bold text-emerald-900">Rental confirmed</h1>
          <p className="mt-1 text-emerald-900 [overflow-wrap:anywhere]">
            Thanks, {confirmation.details.name.trim()}. Your rental starting {confirmation.details.startDate} is confirmed
            for {confirmation.details.email.trim()}.
          </p>
          <p className="mt-1 text-sm text-emerald-800">No payment was taken and nothing was sent — this on-screen confirmation is all there is.</p>
        </div>
        <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Your workspace</h2>
          <ItemList items={confirmation.items} />
          <dl className="mt-3 space-y-1 border-t border-stone-200 pt-3 text-sm">
            <div className="flex justify-between">
              <dt>Weekly total</dt>
              <dd className="font-semibold tabular-nums">{formatPrice(confirmation.weekly)}/week</dd>
            </div>
            <div className="flex justify-between">
              <dt>
                Rental total ({confirmation.weeks} week{confirmation.weeks === 1 ? "" : "s"})
              </dt>
              <dd className="font-semibold tabular-nums">{formatPrice(confirmation.total)}</dd>
            </div>
          </dl>
        </section>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            onClick={() => dispatch({ type: "reset" })}
            className="rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700"
          >
            Start over
          </Link>
          <Link
            href="/"
            className="rounded-xl border border-stone-300 bg-white px-5 py-3 text-sm font-semibold text-stone-900 hover:border-stone-500"
          >
            Back to edit
          </Link>
        </div>
      </main>
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
    <main className="mx-auto w-full max-w-3xl px-4 py-6">
      <Link href="/" className="text-sm font-medium text-stone-600 hover:text-stone-900">
        ← Back to edit
      </Link>
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-stone-900">Checkout</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Your workspace</h2>
          <WorkspacePreview />
          {items.length ? (
            <ItemList items={items} />
          ) : (
            <p className="text-sm text-stone-600">Nothing selected yet.</p>
          )}
          <div className="flex justify-between border-t border-stone-200 pt-3 text-sm">
            <span>Weekly total</span>
            <span className="font-semibold tabular-nums">{formatPrice(weekly)}/week</span>
          </div>
        </section>

        <form noValidate onSubmit={onSubmit} className="min-w-0 space-y-4 rounded-2xl border border-stone-200 bg-white p-5">
          <h2 className="text-lg font-semibold">Rental details</h2>
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

          <dl className="space-y-1 border-t border-stone-200 pt-3 text-sm">
            <div className="flex justify-between">
              <dt>Weekly total</dt>
              <dd className="tabular-nums">{formatPrice(weekly)}/week</dd>
            </div>
            <div className="flex justify-between text-base">
              <dt className="font-semibold">Rental total{weeksValid ? ` (${weeks} week${weeks === 1 ? "" : "s"})` : ""}</dt>
              <dd className="font-semibold tabular-nums">{weeksValid ? formatPrice(rentalTotal(selection, weeks)) : "—"}</dd>
            </div>
          </dl>

          {!ready && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900" role="status">
              Pick a desk and a chair before confirming.{" "}
              <Link href="/" className="font-medium underline">
                Choose now
              </Link>
            </p>
          )}
          <button
            type="submit"
            disabled={!ready}
            className="w-full rounded-xl bg-stone-900 px-5 py-3 text-sm font-semibold text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Confirm rental
          </button>
          <p className="text-center text-xs text-stone-500">No payment is taken.</p>
        </form>
      </div>
    </main>
  );
}
