import axios from 'axios';

// Retrieve API key from .env
const API_KEY = import.meta.env.VITE_RIOT_API_KEY;

// Check for API key
if (!API_KEY) {
  throw new Error('API key not found. Please check the .env file and ensure the VITE_RIOT_API_KEY variable is defined.');
}

// List of regions
const regions = [
  { tag: 'EUW', label: 'EUW (Europe West)', server: 'euw1', global: 'europe' },
  { tag: 'EUNE', label: 'EUNE (Europe Nordic & East)', server: 'eun1', global: 'europe' },
  { tag: 'NA', label: 'NA (North America)', server: 'na1', global: 'americas' },
  { tag: 'KR', label: 'KR (Korea)', server: 'kr', global: 'asia' },
  { tag: 'BR', label: 'BR (Brazil)', server: 'br1', global: 'americas' },
  { tag: 'JP', label: 'JP (Japan)', server: 'jp1', global: 'asia' },
  { tag: 'RU', label: 'RU (Russia)', server: 'ru', global: 'europe' },
  { tag: 'TR', label: 'TR (Turkey)', server: 'tr1', global: 'europe' },
  { tag: 'LAN', label: 'LAN (Latin America North)', server: 'la1', global: 'americas' },
  { tag: 'LAS', label: 'LAS (Latin America South)', server: 'la2', global: 'americas' },
  { tag: 'OCE', label: 'OCE (Oceania)', server: 'oc1', global: 'americas' },
];

// Function to add a delay (to avoid rate limits)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Function to get the latest Data Dragon version
const getLatestDataDragonVersion = async () => {
  try {
    const response = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
    const versions = await response.json();
    return versions[0]; // Return the latest version
  } catch (error) {
    console.error('Error fetching Data Dragon version:', error);
    return '15.5s.1'; // Fallback version
  }
};

// Get PUUID by Riot ID
const getAccountByRiotId = async (gameName, tagLine, globalRegion) => {
  try {
    const response = await axios.get(
      `https://${globalRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(gameName)}/${encodeURIComponent(tagLine)}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Summoner ID by PUUID
const getSummonerByPuuid = async (puuid, server) => {
  try {
    const response = await axios.get(
      `https://${server}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get rank by PUUID
const getRankByPuuid = async (puuid, server) => {
  try {
    // First, get summonerId by puuid
    const summonerData = await getSummonerByPuuid(puuid, server);
    const summonerId = summonerData.id;

    // Then request rank by summonerId
    const response = await axios.get(
      `https://${server}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    const rankData = response.data.find(entry => entry.queueType === 'RANKED_SOLO_5x5');
    return {
      rank: rankData ? `${rankData.tier} ${rankData.rank} (${rankData.leaguePoints} LP)` : null,
      winRate: rankData ? Math.round((rankData.wins / (rankData.wins + rankData.losses)) * 100) : null,
    };
  } catch (error) {
    throw error;
  }
};

// Get champion mastery by PUUID
const getMasteryByPuuid = async (puuid, server) => {
  try {
    const response = await axios.get(
      `https://${server}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    return response.data.slice(0, 5); // Top 5 champions
  } catch (error) {
    throw error;
  }
};

// Get all recent match IDs by PUUID
const getRecentMatchIds = async (puuid, globalRegion) => {
  const matchIds = [];
  const countPerRequest = 5; // Maximum matches per request
  let start = 0;
  const maxMatches = 10; // Arbitrary limit to avoid infinite loops (adjust as needed)

  try {
    while (start < maxMatches) {
      const response = await axios.get(
        `https://${globalRegion}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids`,
        {
          headers: { 'X-Riot-Token': API_KEY },
          params: {
            start: start,
            count: countPerRequest,
          },
        }
      );

      const newMatchIds = response.data;
      matchIds.push(...newMatchIds);

      // If we received fewer matches than requested, we've reached the end
      if (newMatchIds.length < countPerRequest) {
        break;
      }

      start += countPerRequest;

      // Add a small delay to avoid hitting rate limits
      await delay(100); // 1 second delay between requests
    }

    return matchIds;
  } catch (error) {
    throw error;
  }
};

// Get match details by match ID
const getMatchDetails = async (matchId, globalRegion) => {
  try {
    const response = await axios.get(
      `https://${globalRegion}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
      { headers: { 'X-Riot-Token': API_KEY } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get champion data from Data Dragon
const getChampionData = async () => {
  try {
    const dataDragonVersion = await getLatestDataDragonVersion();
    const response = await fetch(`https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/data/en_US/champion.json`);
    const championJson = await response.json();
    return {
      version: dataDragonVersion,
      championMap: Object.values(championJson.data).reduce((map, champ) => {
        map[champ.key] = champ.id;
        return map;
      }, {}),
    };
  } catch (error) {
    throw error;
  }
};

// Main function to search for a summoner
const searchSummoner = async (gameName, tagLine, selectedRegion) => {
  const selectedRegionData = regions.find(r => r.tag === selectedRegion);
  if (!selectedRegionData) {
    throw new Error(`Invalid region. Please select from the list: ${regions.map(r => r.tag).join(', ')}`);
  }

  let accountData;
  let summonerData;
  let currentRegion;

  // Step 1: Get PUUID by Riot ID
  try {
    console.log(`Step 1: Searching for Riot ID: ${gameName}#${tagLine}`);
    accountData = await getAccountByRiotId(gameName, tagLine, selectedRegionData.global);
    console.log('Riot ID result:', accountData);
  } catch (error) {
    console.error('Error at step 1:', error);
    if (error.response?.status === 404) {
      throw new Error('Player not found. Please check Game Name and Tag Line.');
    } else if (error.response?.status === 403) {
      throw new Error('Access error. Please check your API key.');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait and try again.');
    } else {
      throw new Error('Error fetching Riot ID data. Please try again later.');
    }
  }

  // Step 2: Try to find the player in different regions
  const regionsToTry = regions.map(r => r);
  for (const regionData of regionsToTry) {
    try {
      console.log(`Step 2: Searching for Summoner ID by PUUID: ${accountData.puuid} in region ${regionData.server}`);
      summonerData = await getSummonerByPuuid(accountData.puuid, regionData.server);
      currentRegion = regionData;
      console.log('Summoner data:', summonerData);
      break;
    } catch (error) {
      if (error.response?.status === 404) {
        console.log(`Player not found in region ${regionData.server}. Trying the next one...`);
        continue;
      } else {
        throw error;
      }
    }
  }

  if (!summonerData) {
    throw new Error('Player not found in any region.');
  }

  let rank = null;
  let winRate = null;
  let favoriteChampions = [];
  let recentMatches = [];
  let averageKda = { kills: 0, deaths: 0, assists: 0 };

  try {
    // Step 3: Get rank by PUUID
    console.log(`Step 3: Fetching rank for PUUID: ${accountData.puuid} in region ${currentRegion.server}`);
    const rankData = await getRankByPuuid(accountData.puuid, currentRegion.server);
    rank = rankData.rank;
    winRate = rankData.winRate;
    console.log('Rank data:', rankData);

    // Step 4: Get champion mastery by PUUID
    console.log(`Step 4: Fetching champion mastery for PUUID: ${accountData.puuid}`);
    const topChampions = await getMasteryByPuuid(accountData.puuid, currentRegion.server);
    console.log('Top champions:', topChampions);

    // Step 5: Load champion data from Data Dragon
    console.log('Step 5: Loading champion data from Data Dragon');
    const { version: dataDragonVersion, championMap } = await getChampionData();
    console.log('Champion map:', championMap);

    favoriteChampions = topChampions.map(champ => ({
      id: championMap[champ.championId.toString()],
      image: `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${championMap[champ.championId.toString()]}.png`,
      points: champ.championPoints,
    }));

    // Step 6: Get all recent matches
    console.log(`Step 6: Fetching all recent match IDs for PUUID: ${accountData.puuid}`);
    const matchIds = await getRecentMatchIds(accountData.puuid, currentRegion.global);
    console.log('All recent match IDs:', matchIds);

    // Step 7: Get match details and calculate average KDA
    let totalKills = 0, totalDeaths = 0, totalAssists = 0, matchCount = 0;
    for (const matchId of matchIds) {
      console.log(`Step 7: Fetching details for match ID: ${matchId}`);
      const matchDetails = await getMatchDetails(matchId, currentRegion.global);
      console.log(`Match details for ${matchId}:`, matchDetails);

      // Find the player in the match
      const participant = matchDetails.info.participants.find(p => p.puuid === accountData.puuid);
      if (participant) {
        const championId = participant.championId.toString();
        const championName = championMap[championId] || 'Unknown';
        const win = participant.win;
        const kda = `${participant.kills}/${participant.deaths}/${participant.assists}`;

        recentMatches.push({
          champion: championName,
          championImage: `https://ddragon.leagueoflegends.com/cdn/${dataDragonVersion}/img/champion/${championName}.png`,
          win: win,
          kda: kda,
        });

        // Accumulate KDA for average calculation
        totalKills += participant.kills;
        totalDeaths += participant.deaths;
        totalAssists += participant.assists;
        matchCount++;

        // Add a small delay to avoid hitting rate limits
        await delay(500); // 0.5 second delay between match detail requests
      }
    }

    // Calculate average KDA
    if (matchCount > 0) {
      averageKda = {
        kills: (totalKills / matchCount).toFixed(1),
        deaths: (totalDeaths / matchCount).toFixed(1),
        assists: (totalAssists / matchCount).toFixed(1),
      };
    }
  } catch (error) {
    console.error('Error during additional data loading:', error);
    if (error.response?.status === 403) {
      throw new Error('Access error. Please check your API key.');
    } else if (error.response?.status === 429) {
      throw new Error('Too many requests. Please wait and try again.');
    }
  }

  return {
    summonerStats: {
      name: summonerData.name,
      level: summonerData.summonerLevel,
      rank,
      winRate,
      favoriteChampions,
      region: currentRegion.tag,
      recentMatches,
      averageKda,
    },
    debugInfo: `Player found in region ${currentRegion.tag}${favoriteChampions.length ? '' : ' Failed to load champion data.'}${recentMatches.length ? '' : ' Failed to load recent matches.'}`,
  };
};

export { regions, searchSummoner };
