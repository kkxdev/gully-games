import type { Metadata } from 'next';
import { PageShell } from '@/components/site-shell';
import { RoomLobby } from '@/components/room-lobby';

export const metadata: Metadata = {
  title: 'Pen Fight challenge — Gully Games',
  description:
    'Lunch break, 1994. Settle one more Pen Fight on the school desk.',
  openGraph: {
    title: 'One more Pen Fight?',
    description: 'A friend saved you a place at the school desk.',
    type: 'website',
  },
};

export default async function RoomPage({
  params,
}: {
  params: Promise<{ roomCode: string }>;
}) {
  const { roomCode } = await params;
  return (
    <PageShell>
      <RoomLobby rawCode={roomCode} />
    </PageShell>
  );
}
