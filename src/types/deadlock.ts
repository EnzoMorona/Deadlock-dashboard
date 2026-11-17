export interface Hero {
  id: number;
  name: string;
  class_name: string;
  disabled: boolean;
  hero_type: string;
  complexity: number;
  gun_tag: string;
  tags: string[];

  description: {
    lore: string;
    role: string;
    playstyle: string;
  };

  images: {
    icon_hero_card: string;
    icon_hero_card_webp: string;
    icon_image_small: string;
    icon_image_small_webp: string;
    minimap_image: string;
  };
}


export interface PlayerMatch {
  account_id: number;
  match_id: number;
  hero_id: number;
  hero_level: number;

  start_time: number;
  match_duration_s: number;

  player_kills: number;
  player_deaths: number;
  player_assists: number;

  last_hits: number;
  denies: number;
  net_worth: number;

  player_team: number;
  match_result: number;
  player_match_outcome: number;

  game_mode: number;
  match_mode: number;

  abandoned_time_s: number;
  team_abandoned: boolean;

  ranked_calibration_match: number;
  ranked_delta: number | null;
  ranked_display_badge: number | null;
  ranked_used_demotion_protection: boolean | null;

  brawl_avg_round_time_s: number;
  brawl_score_team0: number;
  brawl_score_team1: number;

  objectives_mask_team0: number;
  objectives_mask_team1: number;
}

