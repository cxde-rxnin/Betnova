import connectToDatabase from "@/lib/db/connect";
import { TeamLogo } from "@/models/TeamLogo";

export class LogoService {
  /**
   * Generates a fallback URL using UI-Avatars.
   */
  static getFallbackLogo(teamName: string, isHome: boolean = true): string {
    const bgColor = isHome ? "2563eb" : "1e293b";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(teamName)}&background=${bgColor}&color=fff&rounded=true&bold=true`;
  }

  /**
   * Fetches logos for an array of team names.
   * Returns a Map of teamName -> logoUrl.
   */
  static async getLogosForTeams(teamNames: string[]): Promise<Record<string, string>> {
    if (teamNames.length === 0) return {};

    await connectToDatabase();

    // 1. Check DB Cache
    const cachedLogos = await TeamLogo.find({ teamName: { $in: teamNames } });
    const logoMap: Record<string, string> = {};
    const foundTeams = new Set<string>();

    for (const cached of cachedLogos) {
      logoMap[cached.teamName] = cached.logoUrl;
      foundTeams.add(cached.teamName);
    }

    // 2. Identify missing teams
    const missingTeams = teamNames.filter((name) => !foundTeams.has(name));

    if (missingTeams.length === 0) {
      return logoMap;
    }

    // 3. Fetch missing teams from TheSportsDB in parallel
    const fetchPromises = missingTeams.map(async (teamName, index) => {
      try {
        const url = `https://www.thesportsdb.com/api/v1/json/3/searchteams.php?t=${encodeURIComponent(teamName)}`;
        const res = await fetch(url, { next: { revalidate: 86400 } }); // Cache at Next.js level for 24h as well
        
        let data = null;
        if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
          data = await res.json();
        }

        let finalUrl = "";
        if (data && data.teams && data.teams.length > 0 && data.teams[0].strBadge) {
          finalUrl = data.teams[0].strBadge;
        } else {
          // If not found, use fallback so we don't keep searching
          finalUrl = this.getFallbackLogo(teamName, index % 2 === 0);
        }

        return { teamName, logoUrl: finalUrl };
      } catch (error) {
        console.warn(`Failed to fetch logo for ${teamName}`, error);
        return { teamName, logoUrl: this.getFallbackLogo(teamName, index % 2 === 0) };
      }
    });

    const results = await Promise.all(fetchPromises);

    // 4. Save to DB bulk and add to map
    const bulkOps = results.map((res) => {
      logoMap[res.teamName] = res.logoUrl;
      return {
        updateOne: {
          filter: { teamName: res.teamName },
          update: { $set: { logoUrl: res.logoUrl } },
          upsert: true,
        },
      };
    });

    if (bulkOps.length > 0) {
      try {
        await TeamLogo.bulkWrite(bulkOps);
      } catch (error) {
        console.error("Failed to bulk write team logos", error);
      }
    }

    return logoMap;
  }
}
