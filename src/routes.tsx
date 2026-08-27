import { Placeholder } from '@/screens/Placeholder';

/**
 * Route map — PLAN.md §4.
 * Screens are swapped in for Placeholder as each build task lands.
 * Keep this list in the same order as §4 so it stays easy to audit.
 */
export const routeDefs = [
  { path: '/', title: 'Landing' },
  { path: '/search', title: 'Results' },
  { path: '/book/passengers', title: 'Passenger details' },
  { path: '/book/review', title: 'Review journey' },
  { path: '/book/payment', title: 'Payment' },
  { path: '/orders', title: 'Your bookings' },
  { path: '/orders/:orderId', title: 'Order' },
  { path: '/ticket/:pnr', title: 'Ticket' },
  { path: '/journey/:pnr', title: 'Journey' },
  { path: '/ready', title: 'Ready to book' },
  { path: '/pnr', title: 'PNR status' },
  { path: '/charts', title: 'Charts / vacancy' },
  { path: '/help/:topic', title: 'Help' },
  { path: '/login', title: 'Choose a demo account' },
] as const;

export function PlaceholderFor({ title }: { title: string }) {
  return (
    <Placeholder
      title={title}
      note="This screen is being built in a later task. Nothing about the route or the surrounding navigation is a mistake — it will fill in as the build proceeds through PLAN.md §12."
    />
  );
}
