import { getLeagueInfo, getLeagueLive, getLeagueUpcoming, getLeaguePast } from "@/features/sportsbook/actions";
import { LiveMarketCard } from "@/components/marketing/live-market-card";
import { Match } from "@/features/sportsbook/types";
import { SportEvent } from "@/lib/mock-data";
import Image from "next/image";

export interface LeagueConfig {
  /** TheSportsDB league ID */
  id: string;
  /** Display name shown before the API responds */
  name: string;
  /** Emoji fallback shown when no badge is available */
  emoji: string;
  /** Tailwind gradient classes for the panel accent */
  accent: string;
}

/** Curated football leagues + top leagues from other sports (TheSportsDB league IDs). */
export const FEATURED_LEAGUES: LeagueConfig[] = [
  { id: "4328", name: "Premier League", emoji: "🏴", accent: "from-purple-600/20 to-purple-600/0" },
  { id: "4335", name: "La Liga", emoji: "🇪🇸", accent: "from-orange-500/20 to-orange-500/0" },
  { id: "4331", name: "Bundesliga", emoji: "🇩🇪", accent: "from-red-600/20 to-red-600/0" },
  { id: "4332", name: "Serie A", emoji: "🇮🇹", accent: "from-blue-600/20 to-blue-600/0" },
  { id: "4334", name: "Ligue 1", emoji: "🇫🇷", accent: "from-indigo-600/20 to-indigo-600/0" },
  { id: "4480", name: "UEFA Champions League", emoji: "🏆", accent: "from-sky-500/20 to-sky-500/0" },
  { id: "4387", name: "NBA", emoji: "🏀", accent: "from-amber-500/20 to-amber-500/0" },
  { id: "4391", name: "NFL", emoji: "🏈", accent: "from-emerald-600/20 to-emerald-600/0" },
  { id: "4380", name: "NHL", emoji: "🏒", accent: "from-cyan-600/20 to-cyan-600/0" },
];

function mapMatchToSportEvent(match: Match): SportEvent {
  const matchResultMarket = match.markets?.find((m) => m.id === "match_result");
  const homeOdd = matchResultMarket?.selections.find((s) => s.id === "home")?.odds ?? 1.85;
  const drawOdd = matchResultMarket?.selections.find((s) => s.id === "draw")?.odds ?? 3.2;
  const awayOdd = matchResultMarket?.selections.find((s) => s.id === "away")?.odds ?? 2.1;

  return {
    id: match.id,
    sportId: match.sportId,
    competitionId: match.competitionId,
    competitionName: match.competitionName,
    homeTeam: match.homeTeam.name,
    homeTeamLogo: match.homeTeam.logo,
    awayTeam: match.awayTeam.name,
    awayTeamLogo: match.awayTeam.logo,
    homeScore: match.score?.home ?? undefined,
    awayScore: match.score?.away ?? undefined,
    status: match.status === "LIVE" ? "live" : match.status === "PRE_MATCH" ? "upcoming" : "finished",
    startTime: match.startTime,
    minute: match.liveStatus?.minute,
    period: match.liveStatus?.period,
    odds: { home: homeOdd, draw: drawOdd, away: awayOdd },
    isFavorite: false,
  };
}

async function LeaguePanel({ league, basePath }: { league: LeagueConfig; basePath: string }) {
  const [info, live, upcoming, past] = await Promise.all([
    getLeagueInfo(league.id).catch(() => null),
    getLeagueLive(league.id).catch(() => []),
    getLeagueUpcoming(league.id).catch(() => []),
  ]);

  const liveEvents = live.map(mapMatchToSportEvent);
  const upcomingEvents = upcoming.map(mapMatchToSportEvent).slice(0, 8);

  // Hide the panel entirely if there is nothing to show.
  if (liveEvents.length === 0 && upcomingEvents.length === 0) {
    return null;
  }

  const displayName = info?.name || league.name;

  return (
    <div className="rounded-2xl border border-border/60 bg-card/50 p-4 sm:p-5 shadow-sm">
      {/* League header */}
      <div className={`-m-4 sm:-m-5 mb-4 sm:mb-5 flex items-center gap-3 rounded-t-2xl bg-linear-to-r ${league.accent} p-4 sm:p-5`}>
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center">
          {info?.badge ? (
            <Image src={info.badge} alt={displayName} fill className="object-contain" />
          ) : (
            <span className="text-2xl" aria-hidden>
              {league.emoji}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-bold tracking-tight">{displayName}</h3>
          <p className="text-xs font-medium text-muted-foreground">
            {liveEvents.length > 0 ? `${liveEvents.length} live now` : `${upcomingEvents.length} upcoming`}
          </p>
        </div>
        {liveEvents.length > 0 && (
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-semibold text-destructive">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-destructive" />
            </span>
            LIVE
          </span>
        )}
      </div>

      {/* Live matches */}
      {liveEvents.length > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-semibold text-destructive">Live Now</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {liveEvents.map((event) => (
              <LiveMarketCard key={event.id} event={event} basePath={basePath} />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming matches */}
      {upcomingEvents.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-primary">Upcoming</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {upcomingEvents.map((event) => (
              <LiveMarketCard key={event.id} event={event} basePath={basePath} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface LeaguesSectionProps {
  basePath?: string;
  leagues?: LeagueConfig[];
  title?: string;
  description?: string;
}

export async function LeaguesSection({
  basePath = "/live",
  leagues = FEATURED_LEAGUES,
  title = "Top Leagues",
  description = "Live and upcoming action from the world's biggest competitions",
}: LeaguesSectionProps = {}) {
  const panels = await Promise.all(
    leagues.map(async (league) => ({
      league,
      node: await LeaguePanel({ league, basePath }),
    }))
  );

  const visiblePanels = panels.filter((panel) => panel.node !== null);

  // Nothing to render across every league.
  if (visiblePanels.length === 0) {
    return null;
  }

  return (
    <section className="my-8 w-full space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-5">
        {visiblePanels.map(({ league, node }) => (
          <div key={league.id}>{node}</div>
        ))}
      </div>
    </section>
  );
}
