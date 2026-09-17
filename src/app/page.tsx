import { GameLauncher } from '@/components/game-launcher';
import { gameCatalog } from '@/games/catalog';
import Link from 'next/link';
export default function Home() {
  const games = gameCatalog;
  return (
    <main>
      <header className="masthead">
        <Link href="/" className="brand">
          <span className="brand-mark">gg</span>Gully Games
          <span className="brand-caption">EST. IN OUR CHILDHOOD</span>
        </Link>
        <span className="school-tag">
          AFTER SCHOOL CLUB <span>●</span>
        </span>
      </header>
      <div className="intro">
        <div>
          <p className="eyebrow">THE NEIGHBOURHOOD · CHAPTER 01</p>
          <h1>
            The bell <em>can wait.</em>
          </h1>
          <p className="intro-copy">
            Back benches. Borrowed pens. One last game before home.
            <br />
            Welcome back to the games we grew up with.
          </p>
        </div>
        <div className="stamp">
          NO BATTERIES
          <br />
          <strong>JUST BACHHPAN</strong>
          <br />
          REQUIRED ✳
        </div>
      </div>
      <div className="location-bar">
        <span>⌂ THE SCHOOL DESK</span>
        <span>Lunch break, sometime in the ’90s</span>
      </div>
      {games
        .filter((game) => game.status === 'playable')
        .map((game) => (
          <GameLauncher key={game.id} gameId={game.id} />
        ))}
      <section className="neighbourhood">
        <div className="roadmap-heading">
          <div>
            <p className="eyebrow">MORE MEMORIES, SAME MOHALLA</p>
            <h2>Around the corner</h2>
          </div>
          <span>The neighbourhood is growing.</span>
        </div>
        <div className="coming-games">
          {games
            .filter((game) => game.status === 'planned')
            .map((game, i) => (
              <article key={game.id}>
                <span className="game-number">0{i + 2}</span>
                <p className="eyebrow">{game.location}</p>
                <h3>{game.name}</h3>
                <p>{game.description}</p>
                <span className="coming-label">COMING LATER</span>
              </article>
            ))}
        </div>
      </section>
      <footer>
        <span>Gully Games</span>
        <p>Made for the kid who never wanted to go home.</p>
        <span>PLAY. REPEAT. REMEMBER.</span>
      </footer>
    </main>
  );
}
