"use client";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { GripVertical, Plus } from "lucide-react";
import type { Holding } from "@/db/schema";
import {
  addHoldingAction,
  deleteHoldingAction,
  reorderHoldingsAction,
  updateHoldingAction,
} from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Fields {
  name: string;
  ticker: string;
  targetPercent: string;
  actualAmount: string;
}

const fieldsOf = (h: Holding): Fields => ({
  name: h.name,
  ticker: h.ticker ?? "",
  targetPercent: String(h.targetPercent),
  actualAmount: String(h.actualAmount),
});

export function HoldingsEditor({
  portfolioId,
  holdings,
  currency,
}: {
  portfolioId: string;
  holdings: Holding[];
  currency: string;
}) {
  // Local order drives the list so a drag feels instant; the server action
  // persists it afterwards.
  const [order, setOrder] = useState(() => holdings.map((h) => h.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [handleId, setHandleId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const byId = new Map(holdings.map((h) => [h.id, h]));
  // Reconcile with the server: new/removed rows appear without losing the order.
  const ids = [
    ...order.filter((id) => byId.has(id)),
    ...holdings.filter((h) => !order.includes(h.id)).map((h) => h.id),
  ];
  const rows = ids.map((id) => byId.get(id)!);

  function persist(next: string[]) {
    setOrder(next);
    startTransition(async () => {
      await reorderHoldingsAction(portfolioId, next);
    });
  }

  function moveTo(dragId: string, targetId: string) {
    if (dragId === targetId) return;
    const next = ids.filter((id) => id !== dragId);
    next.splice(next.indexOf(targetId), 0, dragId);
    // dragover fires continuously; re-rendering on an unchanged order would
    // thrash the drag.
    if (next.every((id, i) => id === ids[i])) return;
    setOrder(next);
  }

  function moveBy(id: string, delta: number) {
    const from = ids.indexOf(id);
    const to = from + delta;
    if (to < 0 || to >= ids.length) return;
    const next = [...ids];
    next.splice(to, 0, next.splice(from, 1)[0]);
    persist(next);
  }

  return (
    <div className="space-y-4">
      {/* Column headers (desktop) */}
      <div className="hidden md:grid grid-cols-12 gap-2 pl-7 pr-1 text-xs font-medium text-muted-foreground">
        <div className="col-span-4">Company</div>
        <div className="col-span-2">Ticker</div>
        <div className="col-span-2">Target %</div>
        <div className="col-span-2">Actual {currency}</div>
        <div className="col-span-2" />
      </div>

      <ul className="space-y-3">
        {rows.map((h) => (
          <li
            key={h.id}
            draggable={handleId === h.id}
            onDragStart={() => setDraggingId(h.id)}
            onDragEnd={() => {
              setDraggingId(null);
              setHandleId(null);
              persist(ids);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              if (draggingId) moveTo(draggingId, h.id);
            }}
            className={`flex items-end gap-1 rounded-md transition-opacity ${
              draggingId === h.id ? "opacity-50" : ""
            }`}
          >
            <button
              type="button"
              aria-label={`Reorder ${h.name}. Use arrow up and down keys to move.`}
              onMouseDown={() => setHandleId(h.id)}
              onMouseUp={() => setHandleId(null)}
              onKeyDown={(e) => {
                if (e.key === "ArrowUp") {
                  e.preventDefault();
                  moveBy(h.id, -1);
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  moveBy(h.id, 1);
                }
              }}
              className="mb-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground rounded p-0.5 focus-visible:outline-2 focus-visible:outline-ring"
            >
              <GripVertical className="size-4" />
            </button>

            <HoldingRow holding={h} portfolioId={portfolioId} currency={currency} />
          </li>
        ))}
      </ul>

      <AddHoldingForm portfolioId={portfolioId} currency={currency} />
    </div>
  );
}

/** One row: uncontrolled-feeling inputs with a dirty check gating Save. */
function HoldingRow({
  holding,
  portfolioId,
  currency,
}: {
  holding: Holding;
  portfolioId: string;
  currency: string;
}) {
  const initial = fieldsOf(holding);
  const [fields, setFields] = useState<Fields>(initial);

  const dirty = (Object.keys(initial) as (keyof Fields)[]).some(
    (k) => fields[k] !== initial[k]
  );
  const isCash = holding.type === "cash";

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  return (
    <form
      action={updateHoldingAction}
      className="grid grid-cols-12 gap-2 items-end flex-1 border-b pb-3"
    >
      <input type="hidden" name="portfolioId" value={portfolioId} />
      <input type="hidden" name="holdingId" value={holding.id} />

      <div className="col-span-6 md:col-span-4 grid gap-1">
        <Label className="md:hidden text-xs text-muted-foreground">
          {isCash ? "Cash" : "Company"}
        </Label>
        <Input
          name="name"
          value={fields.name}
          onChange={set("name")}
          readOnly={isCash}
          className={isCash ? "opacity-70" : ""}
        />
      </div>
      <div className="col-span-6 md:col-span-2 grid gap-1">
        <Label className="md:hidden text-xs text-muted-foreground">Ticker</Label>
        <Input
          name="ticker"
          value={fields.ticker}
          onChange={set("ticker")}
          disabled={isCash}
          placeholder={isCash ? "—" : ""}
        />
      </div>
      <div className="col-span-4 md:col-span-2 grid gap-1">
        <Label className="md:hidden text-xs text-muted-foreground">Target %</Label>
        <Input
          name="targetPercent"
          type="number"
          step="any"
          min="0"
          max="100"
          value={fields.targetPercent}
          onChange={set("targetPercent")}
        />
      </div>
      <div className="col-span-4 md:col-span-2 grid gap-1">
        <Label className="md:hidden text-xs text-muted-foreground">
          Actual {currency}
        </Label>
        <Input
          name="actualAmount"
          type="number"
          step="any"
          min="0"
          value={fields.actualAmount}
          onChange={set("actualAmount")}
        />
      </div>
      <div className="col-span-4 md:col-span-2 flex gap-2">
        <SaveButton dirty={dirty} />
        {!isCash && (
          <Button
            type="submit"
            variant="destructive"
            size="sm"
            formAction={deleteHoldingAction}
          >
            Delete
          </Button>
        )}
      </div>
    </form>
  );
}

/** Disabled until something actually changed; shows progress while submitting. */
function SaveButton({ dirty }: { dirty: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" disabled={!dirty || pending}>
      {pending ? "Saving…" : dirty ? "Save" : "Saved"}
    </Button>
  );
}

function AddHoldingForm({
  portfolioId,
  currency,
}: {
  portfolioId: string;
  currency: string;
}) {
  const [name, setName] = useState("");

  return (
    <form action={addHoldingAction} className="grid grid-cols-12 gap-2 items-end pt-2">
      <input type="hidden" name="portfolioId" value={portfolioId} />
      <div className="col-span-6 md:col-span-4 grid gap-1">
        <Label className="text-xs text-muted-foreground">Add company</Label>
        <Input
          name="name"
          placeholder="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div className="col-span-6 md:col-span-2 grid gap-1">
        <Label className="text-xs text-muted-foreground">Ticker</Label>
        <Input name="ticker" placeholder="AAPL" />
      </div>
      <div className="col-span-4 md:col-span-2 grid gap-1">
        <Label className="text-xs text-muted-foreground">Target %</Label>
        <Input name="targetPercent" type="number" step="any" min="0" max="100" defaultValue={0} />
      </div>
      <div className="col-span-4 md:col-span-2 grid gap-1">
        <Label className="text-xs text-muted-foreground">Actual {currency}</Label>
        <Input name="actualAmount" type="number" step="any" min="0" defaultValue={0} />
      </div>
      <div className="col-span-4 md:col-span-2">
        <AddButton disabled={!name.trim()} />
      </div>
    </form>
  );
}

function AddButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="w-full" disabled={disabled || pending}>
      <Plus /> {pending ? "Adding…" : "Add"}
    </Button>
  );
}
