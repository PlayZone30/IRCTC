import { TrainFront } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

/**
 * 404 — not part of the PLAN.md §4 route map by design (it's a
 * catch-all, not a screen spec), but required by §0 rule 4: "never
 * leave a dead end." Any unmatched path lands here instead of a blank
 * React Router fallback.
 */
export function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-20 sm:px-6">
      <EmptyState
        icon={<TrainFront className="size-5" />}
        title="This page doesn't exist"
        description="The link may be out of date, or the page moved. Start again from search, or your bookings."
        action={
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate('/')}>Search trains</Button>
            <Button variant="ghost" onClick={() => navigate('/orders')}>
              Your bookings
            </Button>
          </div>
        }
      />
    </div>
  );
}
