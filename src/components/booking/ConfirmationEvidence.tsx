import { useI18n } from '@/i18n';
import { Chip } from '@/components/ui/Chip';
import { CONFIRMATION_BAND_LABEL, CONFIRMATION_BAND_VARIANT, type ConfirmationEvidence as Evidence } from '@/domain/confirmation';

/**
 * ConfirmationEvidence — PLAN.md §7.5. The direct replacement for a
 * confirmation percentage. Shows a band, a plain-language sparkline of
 * the ten historical values with the user's position drawn as a
 * reference line, and a method note. Never a percentage anywhere.
 */
export function ConfirmationEvidenceBlock({ evidence, classLabel, statusLabel }: { evidence: Evidence; classLabel: string; statusLabel: string }) {
  const { t } = useI18n();

  return (
    <div className="rounded-[var(--r-field)] bg-[var(--surface-2)] p-4">
      <div className="mb-2 flex items-center gap-2">
        <Chip variant={CONFIRMATION_BAND_VARIANT[evidence.band]}>{CONFIRMATION_BAND_LABEL[evidence.band]}</Chip>
        <span className="tnum text-xs text-[var(--ink-2)]">
          {t('confirmation.yourPosition', { status: statusLabel, number: evidence.userNumber })}
        </span>
      </div>

      <p className="mb-2 text-xs text-[var(--ink-3)]">{t('confirmation.evidenceHeading', { class: classLabel })}</p>

      <Sparkline values={evidence.history} referenceValue={evidence.userNumber} />

      <p className="mt-2 text-[11px] leading-relaxed text-[var(--ink-3)]">{t('confirmation.methodNote')}</p>
    </div>
  );
}

/**
 * A small bar-row sparkline: one bar per historical value, plus a
 * horizontal reference line at the user's current position, so the
 * comparison is visual and instant rather than requiring the user to
 * read ten numbers. Pure SVG, no charting library (PLAN.md §11.1).
 */
function Sparkline({ values, referenceValue }: { values: number[]; referenceValue: number }) {
  const width = 280;
  const height = 56;
  const barGap = 4;
  const barWidth = (width - barGap * (values.length - 1)) / values.length;
  const maxValue = Math.max(...values, referenceValue);
  const referenceY = height - (referenceValue / maxValue) * height;

  return (
    <div>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} role="img" aria-label={`Historical waitlist clearance: ${values.join(', ')}. Your position: ${referenceValue}.`}>
        {values.map((v, i) => {
          const barHeight = Math.max(2, (v / maxValue) * height);
          const x = i * (barWidth + barGap);
          const clearsUser = v >= referenceValue;
          return (
            <rect
              key={i}
              x={x}
              y={height - barHeight}
              width={barWidth}
              height={barHeight}
              rx={1.5}
              fill={clearsUser ? 'var(--cnf)' : 'var(--hairline)'}
            />
          );
        })}
        <line
          x1={0}
          x2={width}
          y1={referenceY}
          y2={referenceY}
          stroke="var(--wl)"
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
      </svg>
      <div className="tnum mt-1 flex justify-between text-[10px] text-[var(--ink-3)]">
        <span>{values.join(', ')}</span>
      </div>
    </div>
  );
}
