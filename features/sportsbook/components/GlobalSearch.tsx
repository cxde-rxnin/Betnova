"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSports, useUpcomingMatches } from "../hooks";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Link from "next/link";
import { useDebounce } from "use-debounce";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);

  const { data: sports } = useSports();
  const { data: upcomingMatches, isLoading } = useUpcomingMatches();

  const searchResults = () => {
    if (!debouncedQuery || debouncedQuery.length < 2) return null;
    
    const lowerQuery = debouncedQuery.toLowerCase();
    
    const matchedSports = sports?.filter(s => s.name.toLowerCase().includes(lowerQuery)) || [];
    const matchedMatches = upcomingMatches?.filter(m => 
      m.homeTeam.name.toLowerCase().includes(lowerQuery) || 
      m.awayTeam.name.toLowerCase().includes(lowerQuery) ||
      m.competitionName.toLowerCase().includes(lowerQuery)
    ) || [];

    return { sports: matchedSports, matches: matchedMatches };
  };

  const results = searchResults();

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger nativeButton={false} render={<div className="relative w-full max-w-sm hidden md:block" />}>
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search teams, sports..."
            className="w-full bg-muted/50 pl-9 rounded-full focus-visible:ring-1"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (e.target.value.length > 1) setOpen(true);
              else setOpen(false);
            }}
          />
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        {isLoading ? (
          <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
        ) : results ? (
          <div className="max-h-[300px] overflow-y-auto">
            {results.sports.length > 0 && (
              <div className="p-2 border-b">
                <div className="text-xs font-semibold text-muted-foreground mb-1 px-2">SPORTS</div>
                {results.sports.map(sport => (
                  <Link key={sport.id} href={`/sports/${sport.id}`} onClick={() => setOpen(false)} className="block px-2 py-1.5 text-sm rounded-md hover:bg-muted">
                    {sport.icon} {sport.name}
                  </Link>
                ))}
              </div>
            )}
            {results.matches.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-semibold text-muted-foreground mb-1 px-2">TEAMS & MATCHES</div>
                {results.matches.slice(0, 5).map(match => (
                  <Link key={match.id} href={`/sports/match/${match.id}`} onClick={() => setOpen(false)} className="block px-2 py-1.5 text-sm rounded-md hover:bg-muted">
                    <div className="font-medium">{match.homeTeam.name} vs {match.awayTeam.name}</div>
                    <div className="text-xs text-muted-foreground">{match.competitionName}</div>
                  </Link>
                ))}
              </div>
            )}
            {results.sports.length === 0 && results.matches.length === 0 && (
              <div className="p-4 text-sm text-center text-muted-foreground">No results found for "{debouncedQuery}"</div>
            )}
          </div>
        ) : (
          <div className="p-4 text-sm text-center text-muted-foreground">Type at least 2 characters to search.</div>
        )}
      </PopoverContent>
    </Popover>
  );
}
