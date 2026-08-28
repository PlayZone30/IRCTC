import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, Send, Sparkles, X } from 'lucide-react';
import { cx } from '@/lib/cx';
import { useI18n } from '@/i18n';
import { Chip } from '@/components/ui/Chip';
import { IconButton } from '@/components/ui/IconButton';
import { Sheet } from '@/components/ui/Sheet';
import { useAgentStore, type EffectHandlers } from '@/agent/session';
import type { AgentMessage, StepTraceEntry } from '@/agent/types';
import { useBookingStore } from '@/store/booking';
import { useReadyStore } from '@/store/ready';
import { useSessionStore } from '@/store/session';
import type { QuotaCode } from '@/domain/types';

/**
 * Sarathi drawer — PLAN.md §S11, §7.11. Global on every route. The rule
 * that defines it: as the agent works, the main application behind the
 * drawer updates. It drives the real UI; it does not narrate a parallel
 * reality. And there is no way to pay from here — payment is always a
 * human action on a real screen.
 */
export function AgentDrawer() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const open = useAgentStore((s) => s.open);
  const messages = useAgentStore((s) => s.messages);
  const chips = useAgentStore((s) => s.chips);
  const isTyping = useAgentStore((s) => s.isTyping);
  const prefill = useAgentStore((s) => s.prefill);
  const openDrawer = useAgentStore((s) => s.openDrawer);
  const closeDrawer = useAgentStore((s) => s.closeDrawer);
  const reset = useAgentStore((s) => s.reset);
  const submit = useAgentStore((s) => s.submit);

  const setSearch = useBookingStore((s) => s.setSearch);
  const setDraft = useBookingStore((s) => s.setDraft);
  const arm = useReadyStore((s) => s.arm);
  const accountId = useSessionStore((s) => s.accountId);

  const [input, setInput] = useState('');
  const [permOpen, setPermOpen] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Open via ?agent=open deep link (used for the demo recording, §4).
  useEffect(() => {
    if (searchParams.get('agent') === 'open') {
      openDrawer();
      searchParams.delete('agent');
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Drop the landing-teaser prefill into the composer.
  useEffect(() => {
    if (open && prefill) {
      setInput(prefill);
      inputRef.current?.focus();
    }
  }, [open, prefill]);

  // Keep the message list pinned to the latest bubble.
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isTyping]);

  const handlers: EffectHandlers = {
    accountId,
    runSearch: (fromCode, toCode, date, quota) => {
      setSearch({ fromCode, toCode, date, quota: (quota as QuotaCode) ?? 'GN' });
      navigate(`/search?from=${fromCode}&to=${toCode}&date=${date}`);
    },
    navigate: (to) => navigate(to),
    prepareDraft: (effect) => {
      setDraft(effect.draft);
      navigate('/book/review');
    },
    armForWindow: (effect) => {
      arm(effect.draft);
      navigate('/ready');
    },
  };

  function send(text: string) {
    const value = text.trim();
    if (!value) return;
    setInput('');
    void submit(value, handlers);
  }

  return (
    <>
      {/* Launcher — fixed, on every route. */}
      {!open ? (
        <button
          type="button"
          onClick={() => openDrawer()}
          className="anim-press fixed right-4 bottom-4 z-40 flex items-center gap-2.5 rounded-full bg-[var(--ink)] py-3 pr-5 pl-4 text-white shadow-[var(--shadow-3)] hover:bg-[var(--ink-press)]"
          aria-label={`Open ${t('agent.name')}`}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-[var(--primary)]">
            <Sparkles className="size-4" aria-hidden />
          </span>
          <span className="text-left leading-tight">
            <span className="block text-sm font-bold">{t('agent.name')}</span>
            <span className="block text-[11px] font-medium text-white/70">{t('agent.proposesNeverPays')}</span>
          </span>
        </button>
      ) : null}

      {/* Drawer */}
      {open ? (
        <div className="fixed inset-0 z-50 flex" role="presentation">
          <div className="anim-fade-in absolute inset-0 bg-[rgba(24,29,42,0.4)]" onClick={closeDrawer} aria-hidden />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={t('agent.name')}
            className={cx(
              'relative mt-auto flex h-[92vh] w-full flex-col bg-[var(--surface)] shadow-[var(--shadow-3)]',
              'rounded-t-[var(--r-sheet)]',
              'min-[900px]:mt-0 min-[900px]:ml-auto min-[900px]:h-full min-[900px]:w-[440px] min-[900px]:rounded-t-none min-[900px]:rounded-l-[var(--r-sheet)]',
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 border-b border-[var(--hairline)] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <span className="flex size-8 items-center justify-center rounded-full bg-[var(--primary)] text-white">
                  <Sparkles className="size-4" aria-hidden />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[var(--ink)]">{t('agent.name')}</span>
                    <Chip variant="outline">{t('agent.proposesNeverPays')}</Chip>
                  </div>
                  <button type="button" onClick={() => setPermOpen(true)} className="text-xs font-medium text-[var(--primary)] hover:underline">
                    {t('agent.whatICanDo')}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button type="button" onClick={reset} className="rounded-[var(--r-chip)] px-2 py-1 text-xs font-bold text-[var(--ink-3)] hover:bg-[var(--surface-2)]">
                  Reset
                </button>
                <IconButton icon={<X className="size-4" />} aria-label={t('common.close')} onClick={closeDrawer} />
              </div>
            </div>

            {/* Messages */}
            <div ref={listRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
              {messages.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {isTyping ? <TypingIndicator /> : null}
            </div>

            {/* Chips + composer */}
            <div className="border-t border-[var(--hairline)] px-5 py-3">
              {chips.length ? (
                <div className="mb-2.5 flex flex-wrap gap-2">
                  {chips.map((c) => (
                    <button
                      key={c.label}
                      type="button"
                      onClick={() => send(c.value)}
                      className="rounded-full border border-[var(--hairline)] bg-[var(--surface)] px-3 py-1.5 text-xs font-bold text-[var(--ink-2)] hover:bg-[var(--surface-2)]"
                    >
                      {c.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      send(input);
                    }
                  }}
                  rows={1}
                  placeholder={t('agent.composerPlaceholder')}
                  className="max-h-28 min-h-11 flex-1 resize-none rounded-[var(--r-field)] border border-[var(--hairline)] px-3 py-2.5 text-sm outline-none focus:shadow-[var(--focus)]"
                />
                <IconButton icon={<Send className="size-4" />} aria-label="Send" onClick={() => send(input)} />
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Permission card (§7.11) */}
      <Sheet open={permOpen} onClose={() => setPermOpen(false)} title={t('agent.whatICanDo')}>
        <div className="space-y-4">
          <div>
            <h3 className="mb-1 text-sm font-bold text-[var(--cnf)]">Can</h3>
            <p className="text-sm leading-relaxed text-[var(--ink-2)]">{t('agent.canDo')}</p>
          </div>
          <div>
            <h3 className="mb-1 text-sm font-bold text-[var(--wl)]">Cannot</h3>
            <p className="text-sm leading-relaxed text-[var(--ink-2)]">{t('agent.cannotDo')}</p>
          </div>
        </div>
      </Sheet>
    </>
  );
}

function MessageBubble({ message }: { message: AgentMessage }) {
  const isUser = message.author === 'user';
  return (
    <div className={cx('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cx('max-w-[85%]')}>
        <div
          className={cx(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isUser ? 'bg-[var(--primary)] text-white' : 'bg-[var(--surface-2)] text-[var(--ink)]',
          )}
        >
          {message.text}
        </div>
        {message.trace && message.trace.length ? <StepTrace trace={message.trace} /> : null}
      </div>
    </div>
  );
}

function StepTrace({ trace }: { trace: StepTraceEntry[] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-1.5">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--ink-3)] hover:text-[var(--ink-2)]"
      >
        <ChevronDown className={cx('size-3 transition-transform', open && 'rotate-180')} aria-hidden />
        {open ? 'Hide steps' : `Show steps (${trace.length})`}
      </button>
      {open ? (
        <ol className="mt-1.5 space-y-1 rounded-[var(--r-field)] border border-[var(--hairline)] bg-[var(--surface)] p-2.5">
          {trace.map((step, i) => (
            <li key={i} className="flex items-baseline justify-between gap-3 text-[11px]">
              <code className="font-bold text-[var(--primary-press)]">{step.tool}</code>
              <span className="tnum text-right text-[var(--ink-3)]">{step.result}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start" aria-label="Sarathi is typing">
      <div className="flex items-center gap-1 rounded-2xl bg-[var(--surface-2)] px-3.5 py-3">
        <span className="size-1.5 animate-bounce rounded-full bg-[var(--ink-3)] [animation-delay:-0.3s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-[var(--ink-3)] [animation-delay:-0.15s]" />
        <span className="size-1.5 animate-bounce rounded-full bg-[var(--ink-3)]" />
      </div>
    </div>
  );
}
