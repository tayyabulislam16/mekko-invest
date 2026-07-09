"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import type { Portfolio } from "@/db/schema";
import { updateCapitalAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PortfolioSettingsForm({ portfolio }: { portfolio: Portfolio }) {
  const initial = {
    name: portfolio.name,
    totalCapital: String(portfolio.totalCapital),
    currency: portfolio.currency,
  };
  const [fields, setFields] = useState(initial);

  const dirty = (Object.keys(initial) as (keyof typeof initial)[]).some(
    (k) => fields[k] !== initial[k]
  );

  const set =
    (k: keyof typeof initial) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form action={updateCapitalAction} className="grid sm:grid-cols-3 gap-4 items-end">
      <input type="hidden" name="portfolioId" value={portfolio.id} />
      <div className="grid gap-1.5">
        <Label htmlFor="name">Name</Label>
        <Input id="name" name="name" value={fields.name} onChange={set("name")} />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="totalCapital">Total target capital</Label>
        <Input
          id="totalCapital"
          name="totalCapital"
          type="number"
          step="any"
          min="0"
          value={fields.totalCapital}
          onChange={set("totalCapital")}
        />
      </div>
      <div className="grid gap-1.5">
        <Label htmlFor="currency">Currency</Label>
        <Input
          id="currency"
          name="currency"
          maxLength={3}
          className="uppercase"
          value={fields.currency}
          onChange={set("currency")}
        />
      </div>
      <div className="sm:col-span-3">
        <SaveSettingsButton dirty={dirty} />
      </div>
    </form>
  );
}

function SaveSettingsButton({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={!dirty || pending}>
      {pending ? "Saving…" : dirty ? "Save settings" : "Saved"}
    </Button>
  );
}
