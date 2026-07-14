"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useSports, useUpcomingMatches } from "../hooks";
import Link from "next/link";
import { useDebounce } from "use-debounce";

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery] = useDebounce(query, 300);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: sports } = useSports();
  const { data: upcomingMatches, isLoading } = useUpcomingMatches();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = () => {
    if (!debouncedQuery || debouncedQuery.length < 2) return null;
    
    const lowerQuery = debouncedQuery.toLowerCase();
    
    const matchedSports = sports?.filter((s: any) => s.name.toLowerCase().includes(lowerQuery)) || [];
    const matchedMatches = upcomingMatches?.filter((m: any) => 
      m.homeTeam.name.toLowerCase().includes(lowerQuery) || 
      m.awayTeam.name.toLowerCase().includes(lowerQuery) ||
      m.competitionName.toLowerCase().includes(lowerQuery)
    ) || [];

    return { sports: matchedSports, matches: matchedMatches };
  };

  const results = searchResults();

  return (
    <div className="relative w-full max-w-sm hidden md:block" ref={containerRef}>
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
        onFocus={() => {
          if (query.length > 1) setOpen(true);
        }}
      />
      
      {open && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-[300px] bg-popover border border-border/50 text-popover-foreground rounded-2xl shadow-xl z-50 p-0 flex flex-col gap-2 overflow-hidden animate-in fade-in-0 zoom-in-95">
          {isLoading ? (
            <div className="p-4 text-center"><Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" /></div>
          ) : results ? (
            <div className="max-h-[350px] overflow-y-auto">
              {results.sports.length > 0 && (
                <div className="p-2 border-b border-border/50">
                  <div className="text-xs font-semibold text-muted-foreground mb-1 px-2">SPORTS</div>
                  {results.sports.map((sport: any) => (
                    <Link key={sport.id} href={`/sports/${sport.id}`} onClick={() => setOpen(false)} className="block px-2 py-2 text-sm rounded-md hover:bg-muted/60 transition-colors">
                      <div className="flex items-center gap-2">
                        <span>{sport.name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {results.matches.length > 0 && (
                <div className="p-2">
                  <div className="text-xs font-semibold text-muted-foreground mb-1 px-2">TEAMS & MATCHES</div>
                  {results.matches.slice(0, 5).map((match: any) => (
                    <Link key={match.id} href={`/sports/match/${match.id}`} onClick={() => setOpen(false)} className="block px-2 py-2 text-sm rounded-md hover:bg-muted/60 transition-colors">
                      <div className="font-medium">{match.homeTeam.name} vs {match.awayTeam.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{match.competitionName}</div>
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
        </div>
      )}
    </div>
  );
}
