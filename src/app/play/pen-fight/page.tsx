import { GameLauncher } from '@/components/game-launcher';
import { PageShell } from '@/components/site-shell';

export default function PracticePage() {
  return (
    <PageShell>
      <div className="location-bar">
        <span>⌂ THE SCHOOL DESK</span>
        <span>Practice · CPU</span>
      </div>
      <GameLauncher gameId="pen-fight" />
    </PageShell>
  );
}
