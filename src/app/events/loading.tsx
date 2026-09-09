import { PageIntro } from '@/components/cards';
import { StadiiShell } from '@/components/shell';
import { CardSkeletonGrid } from '@/components/states';

/**
 * The same frame the loaded page uses.
 *
 * A skeleton in a different layout is a page that jumps when the data lands,
 * which is worse than a slightly longer blank.
 */
export default function Loading() {
  return (
    <StadiiShell>
      <PageIntro title="Upcoming events" lede="Loading published events…" />
      <CardSkeletonGrid count={9} />
    </StadiiShell>
  );
}
