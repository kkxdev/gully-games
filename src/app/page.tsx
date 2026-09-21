import Link from 'next/link';
import { PageShell } from '@/components/site-shell';
import { gameCatalog } from '@/games/catalog';

export default function Home() {
  return (
    <PageShell>
      <section className="intro neighbourhood-intro">
        <div>
          <p className="eyebrow">THE NEIGHBOURHOOD · CHAPTER 01</p>
          <h1>
            The bell <em>can wait.</em>
          </h1>
          <p className="intro-copy">
            The school desk you remember, waiting for one more match with an old
            friend.
          </p>
          <Link className="primary-action inline-action" href="/school">
            Enter the school →
          </Link>
        </div>
        <div className="stamp">
          NO BATTERIES
          <br />
          <strong>JUST BACHHPAN</strong>
          <br />
          REQUIRED ✳
        </div>
      </section>
      <section className="chapter-grid" aria-label="Neighbourhood chapters">
        <Link href="/school" className="chapter-card chapter-open">
          <span className="game-number">01</span>
          <p className="eyebrow">OPEN NOW · SCHOOL DESK</p>
          <h2>Pen Fight</h2>
          <p>Borrowed pens. Scratched initials. First to three wins.</p>
          <strong>Lunch break, 1994 →</strong>
        </Link>
        {gameCatalog
          .filter((game) => game.status === 'planned')
          .map((game, index) => (
            <article
              className="chapter-card"
              key={game.id}
              aria-label={`${game.name}, coming later`}
            >
              <span className="game-number">0{index + 2}</span>
              <p className="eyebrow">{game.location}</p>
              <h2>{game.name}</h2>
              <p>{game.description}</p>
              <span className="coming-label">COMING LATER</span>
            </article>
          ))}
      </section>
    </PageShell>
  );
}
