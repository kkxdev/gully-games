import Link from 'next/link';
import { ChallengeForm } from '@/components/challenge-form';
import { PageShell } from '@/components/site-shell';

export default function SchoolPage() {
  return (
    <PageShell>
      <div className="location-bar">
        <span>⌂ THE SCHOOL DESK</span>
        <span>Lunch break, 1994</span>
      </div>
      <section className="school-hero">
        <p className="eyebrow">CHAPTER 01 · VIII-B</p>
        <h1>
          One more <em>Pen Fight?</em>
        </h1>
        <p>
          The fan rattles overhead. The corridor is noisy. Your friend says the
          last round did not count.
        </p>
      </section>
      <section className="social-choice">
        <div className="challenge-panel">
          <p className="eyebrow">PLAY TOGETHER</p>
          <h2>Challenge a school friend</h2>
          <p>
            Make a private two-player desk, then send the invite on WhatsApp or
            anywhere you talk.
          </p>
          <ChallengeForm />
        </div>
        <aside className="practice-panel">
          <p className="eyebrow">PLAY SOLO</p>
          <h2>Practice against the CPU</h2>
          <p>
            Works offline after your first visit. Same first-to-three rules.
          </p>
          <Link
            className="secondary-action inline-action"
            href="/play/pen-fight?mode=practice"
          >
            Start practice
          </Link>
        </aside>
      </section>
    </PageShell>
  );
}
