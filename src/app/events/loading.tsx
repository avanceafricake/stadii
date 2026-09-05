import { Container, PageHeader, Section } from '@/components/primitives';
import { CardSkeletonGrid } from '@/components/states';

export default function Loading() {
  return (
    <>
      <PageHeader title="Upcoming events" lede="Loading published events…" />
      <Container>
        <Section>
          <CardSkeletonGrid count={9} />
        </Section>
      </Container>
    </>
  );
}
