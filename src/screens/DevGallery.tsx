import { useState } from 'react';
import { BookOpen, Search as SearchIcon } from 'lucide-react';
import {
  AvailabilityCell,
  Banner,
  Button,
  Card,
  CardHeader,
  Chip,
  DateStrip,
  EmptyState,
  FareTable,
  IconButton,
  JourneyTimeline,
  SearchBar,
  Sheet,
  Skeleton,
  StationField,
  StatusExplainer,
  Stepper,
  TimelineVertical,
} from '@/components/ui';
import { pushToast } from '@/components/ui/Toast';
import type { Station } from '@/domain/types';

/**
 * TEMPORARY dev-only route for visually reviewing the Task 1 component
 * library together. Not part of the route map in PLAN.md §4 — remove
 * before shipping, or leave it wired to a route no link points to.
 */
const stations: Station[] = [
  { code: 'HYB', name: 'Hyderabad Decan', city: 'Hyderabad', state: 'Telangana', cluster: 'HYD', aliases: ['hyderabad', 'hyd'] },
  { code: 'NDLS', name: 'New Delhi', city: 'Delhi', state: 'Delhi', cluster: 'DEL', aliases: ['delhi', 'new delhi'] },
  { code: 'QLN', name: 'Kollam Jn', city: 'Kollam', state: 'Kerala', cluster: 'KLM', aliases: ['kollam', 'kollam junction'] },
];

export function DevGallery() {
  const [from, setFrom] = useState<Station | null>(stations[0]);
  const [to, setTo] = useState<Station | null>(stations[1]);
  const [date, setDate] = useState('2026-08-27');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('2026-08-27');

  return (
    <div className="mx-auto max-w-[1200px] space-y-8 p-6">
      <h1 className="text-2xl font-bold">Component gallery</h1>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="accent">Accent</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="quiet">Quiet link</Button>
          <Button variant="accent" loading>
            Loading
          </Button>
          <Button variant="accent" disabled>
            Disabled
          </Button>
          <IconButton icon={<SearchIcon className="size-4" />} aria-label="Search" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Chips</h2>
        <div className="flex flex-wrap gap-2">
          <Chip variant="solid-accent">Cheapest</Chip>
          <Chip variant="solid-primary">Recommended</Chip>
          <Chip variant="weak-primary">Popular</Chip>
          <Chip variant="outline">23 seats left</Chip>
          <Chip variant="cnf">CNF · S5/47</Chip>
          <Chip variant="rac">RAC 8</Chip>
          <Chip variant="wl">GNWL 34</Chip>
          <Chip variant="regret">REGRET</Chip>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Banners</h2>
        <div className="space-y-2">
          <Banner variant="info">We place a hold on your money. It is captured only when your ticket is issued.</Banner>
          <Banner variant="warn">You give up the right to board at Hyderabad Decan.</Banner>
          <Banner variant="danger">Ticket not issued. Your money was held, not taken.</Banner>
          <Banner variant="success">Your ticket has been issued.</Banner>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Search bar</h2>
        <SearchBar
          stations={stations}
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onSwap={() => {
            setFrom(to);
            setTo(from);
          }}
          date={date}
          onDateChange={setDate}
          classValue="ALL"
          quotaValue="GN"
          classOptions={[{ value: 'ALL', label: 'All Classes' }]}
          quotaOptions={[{ value: 'GN', label: 'General' }]}
          onClassChange={() => {}}
          onQuotaChange={() => {}}
          onSearch={() => pushToast('Search triggered', 'info')}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Date strip</h2>
        <DateStrip
          selectedIso={selectedDate}
          onSelect={setSelectedDate}
          items={[
            { iso: '2026-08-27', weekday: 'Thu', dayMonth: '27 Aug', chipText: 'CNF', chipVariant: 'cnf' },
            { iso: '2026-08-28', weekday: 'Fri', dayMonth: '28 Aug', chipText: 'RAC', chipVariant: 'rac' },
            { iso: '2026-08-29', weekday: 'Sat', dayMonth: '29 Aug', chipText: 'WL 34', chipVariant: 'wl' },
            { iso: '2026-08-30', weekday: 'Sun', dayMonth: '30 Aug', chipText: 'REGRET', chipVariant: 'regret' },
          ]}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Availability cells</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <AvailabilityCell
            classLabel="AC 3 Tier"
            inventory={{ classCode: '3A', status: { kind: 'CNF', coach: 'B3', berth: 22, berthType: 'LB' }, baseFare: 187500, updatedAgoSec: 42 }}
            selected
          />
          <AvailabilityCell
            classLabel="Sleeper"
            inventory={{ classCode: 'SL', status: { kind: 'WL', type: 'GNWL', number: 34 }, baseFare: 75500, updatedAgoSec: 42 }}
          />
          <AvailabilityCell
            classLabel="AC 2 Tier"
            inventory={{ classCode: '2A', status: { kind: 'RAC', number: 8 }, baseFare: 267500, updatedAgoSec: 42 }}
          />
          <AvailabilityCell
            classLabel="AC First Class"
            inventory={{ classCode: '1A', status: { kind: 'REGRET' }, baseFare: 457500, updatedAgoSec: 42 }}
          />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Status explainer</h2>
        <StatusExplainer
          label="GNWL 34"
          variant="wl"
          consequence="The largest pool, so this clears most often. If it does not clear you cannot board a reserved coach."
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Journey timeline</h2>
        <Card>
          <JourneyTimeline
            durationLabel="26h 00m"
            stops={[
              { stationName: 'Hyderabad Decan', time: '06:00' },
              { stationName: 'Kazipet Jn', transferNote: '' },
              { stationName: 'Nagpur' },
              { stationName: 'New Delhi', time: '08:00' },
            ]}
          />
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Stepper</h2>
        <Stepper current={2} />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Fare table</h2>
        <FareTable
          lines={[
            { label: 'Ticket fare', amountPaise: 457500 },
            { label: 'Convenience fee', amountPaise: 2000, caption: 'incl. GST' },
            { label: 'GST', amountPaise: 360 },
          ]}
          totalLabel="Total fare"
          totalPaise={459860}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Timeline vertical (order state machine)</h2>
        <Card>
          <TimelineVertical
            steps={[
              { key: '1', label: 'Order created', timestamp: '2026-08-27T09:00:00', reference: 'RI-2609-004421', state: 'done' },
              { key: '2', label: 'Payment authorised', timestamp: '2026-08-27T09:00:12', reference: 'AUTH 8846201', state: 'done' },
              { key: '3', label: 'Bank reference received', timestamp: '2026-08-27T09:00:20', reference: 'UTR 526239104882', state: 'done' },
              { key: '4', label: 'Ticket issued', timestamp: null, state: 'active', detail: 'Waiting for PRS to confirm seat allocation.' },
              { key: '5', label: 'Payment captured', timestamp: null, state: 'pending' },
            ]}
          />
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Card + header</h2>
        <Card className="p-0">
          <CardHeader title="Telangana SF Express (12723)" meta={<Chip variant="outline">M T W T F S S</Chip>} />
          <div className="p-5">Body content goes here.</div>
        </Card>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Empty state</h2>
        <EmptyState
          icon={<BookOpen className="size-5" />}
          title="No trains found"
          description="Try a nearby station or an adjacent date."
          action={<Button variant="ghost">Reset filters</Button>}
        />
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Skeleton</h2>
        <div className="flex gap-2">
          <Skeleton className="h-20 w-32" />
          <Skeleton className="h-20 w-32" />
          <Skeleton className="h-20 w-32" />
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-sm font-bold uppercase text-[var(--ink-3)]">Sheet + Toast + StationField (standalone)</h2>
        <div className="flex flex-wrap items-end gap-3">
          <Button onClick={() => setSheetOpen(true)}>Open sheet</Button>
          <Button variant="ghost" onClick={() => pushToast('Saved for offline · updated 12 min ago', 'success')}>
            Fire a toast
          </Button>
          <div className="w-64">
            <StationField
              label="Standalone field"
              value={null}
              onSelect={() => {}}
              stations={stations}
              recentCodes={['HYB', 'NDLS']}
            />
          </div>
        </div>
        <Sheet open={sheetOpen} onClose={() => setSheetOpen(false)} title="Coach map" side="bottom">
          <p className="text-sm text-[var(--ink-2)]">Sheet content, focus-trapped, closes on Escape.</p>
        </Sheet>
      </section>
    </div>
  );
}
