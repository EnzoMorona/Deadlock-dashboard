import axios from "axios";
import type { PlayerMatch } from "../types/deadlock";

const deadlockApi = axios.create({
  baseURL: "https://api.deadlock-api.com",
});

function steamId64ToAccountId(steamId64: string): number {
  const STEAM_ID_BASE = 76561197960265728n;

  const accountId = BigInt(steamId64) - STEAM_ID_BASE;

  return Number(accountId);
}

export async function getHeroes() {
  const response = await deadlockApi.get("/v1/assets/heroes");

  return response.data;
}

export async function getItems() {
  const [weapons, vitality, spirit] = await Promise.all([
    deadlockApi.get("/v1/assets/items/by-slot-type/weapon"),
    deadlockApi.get("/v1/assets/items/by-slot-type/vitality"),
    deadlockApi.get("/v1/assets/items/by-slot-type/spirit")
  ]);

  const response = [
    ...weapons.data,
    ...vitality.data,
    ...spirit.data
  ];

  return response;
}

export async function getPlayerMatchHistory(
  steamId64: string
): Promise<PlayerMatch[]> {
  const accountId = steamId64ToAccountId(steamId64);

  const response = await deadlockApi.get<PlayerMatch[]>(
    `/v1/players/${accountId}/match-history`
  );

  return response.data;
}

export interface PlayerStats {
  totalMatches: number;
  registeredMatches: number;
  wins: number;
  losses: number;
  winrate: number;
  kills: number;
  deaths: number;
  assists: number;
  kda: number;
  averageKills: number;
  averageDeaths: number;
  averageAssists: number;
  averageDuration: number;
}

export function calculatePlayerStats(
  matches: PlayerMatch[]
): PlayerStats {
  const registeredMatches = matches.filter(
    (match) =>
      match.player_kills !== undefined &&
      match.player_deaths !== undefined &&
      match.player_assists !== undefined &&
      match.match_duration_s !== undefined
  );

  const totalKills = registeredMatches.reduce(
    (total, match) => total + (match.player_kills ?? 0),
    0
  );

  const totalDeaths = registeredMatches.reduce(
    (total, match) => total + (match.player_deaths ?? 0),
    0
  );

  const totalAssists = registeredMatches.reduce(
    (total, match) => total + (match.player_assists ?? 0),
    0
  );

  const totalDuration = registeredMatches.reduce(
    (total, match) => total + (match.match_duration_s ?? 0),
    0
  );

  const count = registeredMatches.length;

  return {
    totalMatches: matches.length,
    registeredMatches: count,

    // Ainda não conseguimos calcular com segurança
    wins: 0,
    losses: 0,
    winrate: 0,

    kills: totalKills,
    deaths: totalDeaths,
    assists: totalAssists,

    kda:
      totalDeaths > 0
        ? (totalKills + totalAssists) / totalDeaths
        : totalKills + totalAssists,

    averageKills: count > 0 ? totalKills / count : 0,
    averageDeaths: count > 0 ? totalDeaths / count : 0,
    averageAssists: count > 0 ? totalAssists / count : 0,
    averageDuration: count > 0 ? totalDuration / count : 0,
  };
}



