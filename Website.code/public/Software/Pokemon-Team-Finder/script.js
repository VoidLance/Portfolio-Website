// AI Agent: Check AI_AGENT_GUIDE.md for project instructions including changelog requirements
/*
 * ============================================================
 * POKÉMON FINDER & COMPARISON TOOL
 * ============================================================
 * A web application for searching, comparing, and analyzing Pokémon
 * using data from the PokéAPI (https://pokeapi.co/)
 *
 * Key Features:
 * - Search Pokémon by name or ID
 * - View detailed stats, types, and abilities
 * - Compare two Pokémon side-by-side
 * - Get team recommendations based on type coverage
 * - Responsive design with Tailwind CSS
 *
 * Global State Management
 */

/** @type {Object|null} - Stores profile data for left/comparison Pokémon */
let leftProfile = null;

/** @type {Object|null} - Stores profile data for right/comparison Pokémon */
let rightProfile = null;

/**
 * UTILITY: In-memory cache for API responses
 * Prevents redundant API calls for the same URLs
 * @type {Map<string, any>}
 */
const jsonCache = new Map();

/**
 * UTILITY: Fetch JSON data from API with caching
 *
 * @async
 * @param {string} url - The API endpoint URL to fetch
 * @returns {Promise<Object>} Parsed JSON response from the API
 * @throws {Error} Network errors or invalid JSON responses
 *
 * How it works:
 * 1. Check if URL is already cached
 * 2. If cached, return cached data immediately
 * 3. If not cached, fetch from API
 * 4. Parse response and handle errors
 * 5. Store in cache and return
 */
async function fetchJSON(url) {
  // Return cached data if available (improves performance)
  if (jsonCache.has(url)) {
    console.debug(`[Cache Hit] ${url}`);
    return jsonCache.get(url);
  }

  try {
    console.debug(`[API Call] ${url}`);
    const res = await fetch(url);

    // Check if HTTP response status is OK (200-299)
    if (!res.ok) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    }

    // Parse JSON response
    const data = await res.json();

    // Validate that we got actual data
    if (!data) {
      throw new Error("Empty response from API");
    }

    // Store in cache for future use
    jsonCache.set(url, data);
    return data;
  } catch (error) {
    console.error(`[Fetch Error] Failed to fetch ${url}:`, error);
    throw new Error(`Failed to fetch data from API: ${error.message}`);
  }
}

/**
 * MAIN: Fetch Pokémon data from API and display it
 *
 * This function:
 * 1. Shows loading state
 * 2. Fetches Pokémon data from PokéAPI
 * 3. Fetches type effectiveness data
 * 4. Displays formatted data to user
 * 5. Handles errors gracefully
 *
 * @async
 * @param {string} pokemonName - Name or ID of Pokémon to fetch
 * @param {string} [targetId="pokemon-data"] - DOM element ID to render data into
 */
async function fetchPokemonData(pokemonName, targetId = "pokemon-data") {
  // Validate input
  if (!pokemonName || pokemonName.trim() === "") {
    showError("Please enter a Pokémon name or ID.");
    return;
  }

  // Show loading indicator
  showLoading(true);

  const url = `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`;

  try {
    // Fetch basic Pokémon data
    const data = await fetchJSON(url);

    // Fetch type effectiveness data for each type this Pokémon has
    const typeData = await Promise.all(
      data.types.map((typeInfo) => fetchJSON(typeInfo.type.url)),
    );

    // Display formatted data to user
    displayPokemonData(data, typeData, targetId);
    showError(null); // Clear any previous errors
  } catch (error) {
    console.error("Error fetching Pokémon data:", error);

    // Show user-friendly error message
    if (error.message.includes("404")) {
      showError(
        `Pokémon "${pokemonName}" not found. Please check the spelling.`,
      );
    } else if (error.message.includes("Network")) {
      showError("Network error. Please check your internet connection.");
    } else {
      showError(`Failed to fetch Pokémon data: ${error.message}`);
    }
  } finally {
    // Hide loading indicator
    showLoading(false);
  }
}

/**
 * UTILITY: Display error messages to user
 *
 * @param {string|null} message - Error message to display, or null to clear
 */
function showError(message) {
  const errorElement = document.getElementById("error-message");
  if (!errorElement) {
    console.warn("Error element not found in DOM");
    return;
  }

  if (message) {
    errorElement.textContent = `⚠️ ${message}`;
    errorElement.classList.remove("hidden");
    // Auto-hide after 10 seconds
    setTimeout(() => {
      errorElement.classList.add("hidden");
    }, 10000);
  } else {
    errorElement.classList.add("hidden");
  }
}

/**
 * UTILITY: Show/hide loading indicator
 *
 * @param {boolean} show - Whether to show the loading message
 */
function showLoading(show) {
  const loadingElement = document.getElementById("loading-message");
  if (!loadingElement) {
    console.warn("Loading element not found in DOM");
    return;
  }

  if (show) {
    loadingElement.classList.remove("hidden");
  } else {
    loadingElement.classList.add("hidden");
  }
}

/**
 * CALCULATION: Calculate type effectiveness multipliers
 *
 * Analyzes Pokémon type(s) to determine:
 * - Which types deal double damage (weaknesses)
 * - Which types deal half damage (resistances)
 * - Which types deal zero damage (immunities)
 *
 * @param {Array<Object>} typeData - Array of type data objects from PokéAPI
 * @returns {Object} Object with type names as keys and damage multipliers as values
 *
 * Example output:
 * {
 *   "fire": 2,      // Takes 2x damage from fire
 *   "water": 0.5,   // Takes 0.5x damage from water
 *   "ground": 0     // Immune to ground
 * }
 */
function calculateTypeEffectiveness(typeData) {
  const effectiveness = {};

  // Process each type this Pokémon has
  typeData.forEach((type) => {
    // Weaknesses: types that deal double damage (2x)
    type.damage_relations.double_damage_from.forEach((t) => {
      // Multiply if multiple types share weakness (e.g., Fire/Steel)
      effectiveness[t.name] = (effectiveness[t.name] || 1) * 2;
    });

    // Resistances: types that deal half damage (0.5x)
    type.damage_relations.half_damage_from.forEach((t) => {
      // Average resistances from multiple types
      effectiveness[t.name] = (effectiveness[t.name] || 1) * 0.5;
    });

    // Immunities: types that deal zero damage (0x)
    type.damage_relations.no_damage_from.forEach((t) => {
      effectiveness[t.name] = 0;
    });
  });

  return effectiveness;
}

/**
 * CALCULATION: Calculate Weakness Value score (0-10)
 *
 * Comprehensive defensive typing score considering:
 * 1. Low weakness count (highest priority)
 * 2. High immunity count (second priority)
 * 3. Weakness severity (x2 vs x4)
 * 4. Resistance effectiveness (x0.25 vs x0.5)
 * 5. Type commonality weighting
 *
 * @param {Object} effectiveness - Type effectiveness object from calculateTypeEffectiveness
 * @returns {number} Score from 0-10 where higher is better
 */
function calculateWeaknessValue(effectiveness) {
  // Define type commonality (competitive usage weighting)
  // Higher value = more common in competitive play
  const typeCommonality = {
    fighting: 3.0, // Very common
    ground: 3.0, // Very common
    fire: 2.5,
    water: 2.5,
    ice: 2.5,
    electric: 2.5,
    fairy: 2.5,
    dragon: 2.0,
    steel: 2.0,
    psychic: 2.0,
    dark: 1.5,
    ghost: 1.5,
    rock: 1.5,
    flying: 1.5,
    grass: 1.0,
    poison: 1.0,
    bug: 1.0,
    normal: 0.5, // Least common
  };

  // Categorize all type interactions
  const immunities = [];
  const resistances025 = [];
  const resistances05 = [];
  const weaknesses2x = [];
  const weaknesses4x = [];

  Object.entries(effectiveness).forEach(([type, mult]) => {
    if (mult === 0) immunities.push(type);
    else if (mult === 0.25) resistances025.push(type);
    else if (mult === 0.5) resistances05.push(type);
    else if (mult === 2) weaknesses2x.push(type);
    else if (mult >= 4) weaknesses4x.push(type);
  });

  // Calculate weighted scores
  const getCommonality = (type) => typeCommonality[type] || 1.0;

  // IMMUNITIES: Base 8 points, +commonality bonus
  const immunityScore = immunities.reduce(
    (sum, type) => sum + 8 + getCommonality(type) * 2,
    0,
  );

  // RESISTANCES: Base points + commonality bonus
  const resistance025Score = resistances025.reduce(
    (sum, type) => sum + 4 + getCommonality(type) * 1,
    0,
  );
  const resistance05Score = resistances05.reduce(
    (sum, type) => sum + 2 + getCommonality(type) * 0.5,
    0,
  );

  const totalDefense = immunityScore + resistance025Score + resistance05Score;

  // WEAKNESSES: Base penalty + commonality penalty
  const weakness2xPenalty = weaknesses2x.reduce(
    (sum, type) => sum + 3 + getCommonality(type) * 1.5,
    0,
  );
  const weakness4xPenalty = weaknesses4x.reduce(
    (sum, type) => sum + 8 + getCommonality(type) * 4,
    0,
  );

  const totalWeakness = weakness2xPenalty + weakness4xPenalty;

  // WEAKNESS COUNT PENALTY: Heavily penalize having many weaknesses
  const weaknessCountPenalty = (weaknesses2x.length + weaknesses4x.length) * 2;

  // IMMUNITY COUNT BONUS: Reward having many immunities
  const immunityCountBonus = immunities.length * 3;

  // COMMON TYPE AVOIDANCE BONUS: Reward NOT being weak to common types
  const commonTypes = [
    "fighting",
    "ground",
    "fire",
    "water",
    "ice",
    "electric",
    "fairy",
  ];
  const weaknessTypes = [...weaknesses2x, ...weaknesses4x];
  const commonTypeAvoidanceBonus = commonTypes
    .filter((type) => !weaknessTypes.includes(type))
    .reduce((sum, type) => sum + getCommonality(type) * 1.5, 0);

  // Final calculation using ratio with adjustments
  const adjustedDefense =
    totalDefense + immunityCountBonus + commonTypeAvoidanceBonus;
  const adjustedWeakness = totalWeakness + weaknessCountPenalty;

  if (adjustedDefense === 0 && adjustedWeakness === 0) {
    return "5.0"; // Neutral typing
  }

  if (adjustedWeakness === 0) {
    return "10.0"; // Perfect defensive typing (no weaknesses)
  }

  // Ratio-based score with emphasis on defense quality
  const ratio = adjustedDefense / (adjustedDefense + adjustedWeakness);
  const score = 10 * ratio;

  // Clamp between 0 and 10
  return Math.max(0, Math.min(10, score)).toFixed(1);
}

/**
 * CALCULATION: Calculate combined team defensive score (0-10)
 *
 * Evaluates team coverage by analyzing collective type effectiveness:
 * - Resistances/immunities can cancel or reduce weaknesses to same type
 * - x0 (immunity) cancels any weakness
 * - x0.25 resistance cancels x4 weakness
 * - x0.5 resistance reduces x4 to x2 equivalent
 * - Net result scored using same criteria as individual weakness value
 *
 * @param {Array<Object>} typeDataArray - Array of type effectiveness objects
 * @returns {number} Combined team score from 0-10
 */
function calculateCombinedTeamScore(typeDataArray) {
  // Define type commonality
  const typeCommonality = {
    fighting: 3.0,
    ground: 3.0,
    fire: 2.5,
    water: 2.5,
    ice: 2.5,
    electric: 2.5,
    fairy: 2.5,
    dragon: 2.0,
    steel: 2.0,
    psychic: 2.0,
    dark: 1.5,
    ghost: 1.5,
    rock: 1.5,
    flying: 1.5,
    grass: 1.0,
    poison: 1.0,
    bug: 1.0,
    normal: 0.5,
  };
  const getCommonality = (type) => typeCommonality[type] || 1.0;

  // All possible types
  const allTypes = Object.keys(typeCommonality);

  // Aggregate team coverage for each type
  const teamCoverage = {};

  allTypes.forEach((attackType) => {
    const memberResponses = typeDataArray.map((eff) => {
      const value = eff[attackType];
      // Must explicitly check for undefined/null since 0 is a valid immunity value
      return value !== undefined && value !== null ? value : 1;
    });

    // Check for immunities (highest priority)
    if (memberResponses.includes(0)) {
      teamCoverage[attackType] = { net: "immune", value: 0 };
      return;
    }

    // Find best resistance and worst weakness
    const resistances = memberResponses.filter((m) => m < 1 && m > 0); // Exclude 0 (immunity)
    const weaknesses = memberResponses.filter((m) => m > 1);

    if (resistances.length === 0 && weaknesses.length === 0) {
      // Neutral
      return;
    }

    if (weaknesses.length === 0) {
      // Only resistances - use best one
      const bestResist = Math.min(...resistances);
      teamCoverage[attackType] = {
        net: bestResist === 0.25 ? "resist-025" : "resist-05",
        value: bestResist,
      };
      return;
    }

    if (resistances.length === 0) {
      // Only weaknesses - use worst one
      const worstWeak = Math.max(...weaknesses);
      teamCoverage[attackType] = {
        net: worstWeak >= 4 ? "weak-4x" : "weak-2x",
        value: worstWeak,
      };
      return;
    }

    // Both resistances and weaknesses exist - calculate net effect
    const bestResist = Math.min(...resistances);
    const worstWeak = Math.max(...weaknesses);

    if (bestResist === 0.25 && worstWeak >= 4) {
      // x0.25 cancels x4 - neutralized
      return;
    } else if (bestResist === 0.5 && worstWeak >= 4) {
      // x0.5 reduces x4 to x2 equivalent
      teamCoverage[attackType] = { net: "weak-2x", value: 2 };
    } else if (bestResist <= 0.5 && worstWeak === 2) {
      // Resistance reduces x2 weakness effect
      return; // Neutralized
    } else {
      // Weakness dominates
      teamCoverage[attackType] = {
        net: worstWeak >= 4 ? "weak-4x" : "weak-2x",
        value: worstWeak,
      };
    }
  });

  // Categorize final results
  const immunities = [];
  const resistances025 = [];
  const resistances05 = [];
  const weaknesses2x = [];
  const weaknesses4x = [];

  Object.entries(teamCoverage).forEach(([type, data]) => {
    if (data.net === "immune") immunities.push(type);
    else if (data.net === "resist-025") resistances025.push(type);
    else if (data.net === "resist-05") resistances05.push(type);
    else if (data.net === "weak-2x") weaknesses2x.push(type);
    else if (data.net === "weak-4x") weaknesses4x.push(type);
  });

  // Apply same scoring as individual weakness value
  const immunityScore = immunities.reduce(
    (sum, type) => sum + 8 + getCommonality(type) * 2,
    0,
  );

  const resistance025Score = resistances025.reduce(
    (sum, type) => sum + 4 + getCommonality(type) * 1,
    0,
  );
  const resistance05Score = resistances05.reduce(
    (sum, type) => sum + 2 + getCommonality(type) * 0.5,
    0,
  );

  const totalDefense = immunityScore + resistance025Score + resistance05Score;

  const weakness2xPenalty = weaknesses2x.reduce(
    (sum, type) => sum + 3 + getCommonality(type) * 1.5,
    0,
  );
  const weakness4xPenalty = weaknesses4x.reduce(
    (sum, type) => sum + 8 + getCommonality(type) * 4,
    0,
  );

  const totalWeakness = weakness2xPenalty + weakness4xPenalty;

  const weaknessCountPenalty = (weaknesses2x.length + weaknesses4x.length) * 2;
  const immunityCountBonus = immunities.length * 3;

  const commonTypes = [
    "fighting",
    "ground",
    "fire",
    "water",
    "ice",
    "electric",
    "fairy",
  ];
  const weaknessTypes = [...weaknesses2x, ...weaknesses4x];
  const commonTypeAvoidanceBonus = commonTypes
    .filter((type) => !weaknessTypes.includes(type))
    .reduce((sum, type) => sum + getCommonality(type) * 1.5, 0);

  const adjustedDefense =
    totalDefense + immunityCountBonus + commonTypeAvoidanceBonus;
  const adjustedWeakness = totalWeakness + weaknessCountPenalty;

  if (adjustedDefense === 0 && adjustedWeakness === 0) {
    return 5.0;
  }

  if (adjustedWeakness === 0) {
    return 10.0;
  }

  const ratio = adjustedDefense / (adjustedDefense + adjustedWeakness);
  const score = 10 * ratio;

  return Math.max(0, Math.min(10, score));
}

/**
 * UTILITY: Generate detailed breakdown of combined team score calculation
 * Shows all the factors that went into the score
 *
 * @param {Array<Object>} typeDataArray - Array of type effectiveness objects
 * @returns {string} HTML string showing calculation breakdown
 */
function generateTeamScoreBreakdown(typeDataArray) {
  const typeCommonality = {
    fighting: 3.0,
    ground: 3.0,
    fire: 2.5,
    water: 2.5,
    ice: 2.5,
    electric: 2.5,
    fairy: 2.5,
    dragon: 2.0,
    steel: 2.0,
    psychic: 2.0,
    dark: 1.5,
    ghost: 1.5,
    rock: 1.5,
    flying: 1.5,
    grass: 1.0,
    poison: 1.0,
    bug: 1.0,
    normal: 0.5,
  };
  const getCommonality = (type) => typeCommonality[type] || 1.0;
  const allTypes = Object.keys(typeCommonality);

  // Aggregate team coverage
  const teamCoverage = {};
  allTypes.forEach((attackType) => {
    const memberResponses = typeDataArray.map((eff) => {
      const value = eff[attackType];
      // Must explicitly check for undefined/null since 0 is a valid immunity value
      return value !== undefined && value !== null ? value : 1;
    });

    if (memberResponses.includes(0)) {
      teamCoverage[attackType] = { net: "immune", value: 0 };
      return;
    }

    const resistances = memberResponses.filter((m) => m < 1 && m > 0); // Exclude 0 (immunity)
    const weaknesses = memberResponses.filter((m) => m > 1);

    if (resistances.length === 0 && weaknesses.length === 0) return;

    if (weaknesses.length === 0) {
      const bestResist = Math.min(...resistances);
      teamCoverage[attackType] = {
        net: bestResist === 0.25 ? "resist-025" : "resist-05",
        value: bestResist,
      };
      return;
    }

    if (resistances.length === 0) {
      const worstWeak = Math.max(...weaknesses);
      teamCoverage[attackType] = {
        net: worstWeak >= 4 ? "weak-4x" : "weak-2x",
        value: worstWeak,
      };
      return;
    }

    const bestResist = Math.min(...resistances);
    const worstWeak = Math.max(...weaknesses);

    if (bestResist === 0.25 && worstWeak >= 4) {
      return;
    } else if (bestResist === 0.5 && worstWeak >= 4) {
      teamCoverage[attackType] = { net: "weak-2x", value: 2 };
    } else if (bestResist <= 0.5 && worstWeak === 2) {
      return;
    } else {
      teamCoverage[attackType] = {
        net: worstWeak >= 4 ? "weak-4x" : "weak-2x",
        value: worstWeak,
      };
    }
  });

  // Categorize
  const immunities = [];
  const resistances025 = [];
  const resistances05 = [];
  const weaknesses2x = [];
  const weaknesses4x = [];

  Object.entries(teamCoverage).forEach(([type, data]) => {
    if (data.net === "immune") immunities.push(type);
    else if (data.net === "resist-025") resistances025.push(type);
    else if (data.net === "resist-05") resistances05.push(type);
    else if (data.net === "weak-2x") weaknesses2x.push(type);
    else if (data.net === "weak-4x") weaknesses4x.push(type);
  });

  // Calculate scores
  const immunityScore = immunities.reduce(
    (sum, type) => sum + 8 + getCommonality(type) * 2,
    0,
  );
  const resistance025Score = resistances025.reduce(
    (sum, type) => sum + 4 + getCommonality(type) * 1,
    0,
  );
  const resistance05Score = resistances05.reduce(
    (sum, type) => sum + 2 + getCommonality(type) * 0.5,
    0,
  );
  const totalDefense = immunityScore + resistance025Score + resistance05Score;

  const weakness2xPenalty = weaknesses2x.reduce(
    (sum, type) => sum + 3 + getCommonality(type) * 1.5,
    0,
  );
  const weakness4xPenalty = weaknesses4x.reduce(
    (sum, type) => sum + 8 + getCommonality(type) * 4,
    0,
  );
  const totalWeakness = weakness2xPenalty + weakness4xPenalty;

  const weaknessCountPenalty = (weaknesses2x.length + weaknesses4x.length) * 2;
  const immunityCountBonus = immunities.length * 3;

  const commonTypes = [
    "fighting",
    "ground",
    "fire",
    "water",
    "ice",
    "electric",
    "fairy",
  ];
  const weaknessTypes = [...weaknesses2x, ...weaknesses4x];
  const commonTypeAvoidanceBonus = commonTypes
    .filter((type) => !weaknessTypes.includes(type))
    .reduce((sum, type) => sum + getCommonality(type) * 1.5, 0);

  const adjustedDefense =
    totalDefense + immunityCountBonus + commonTypeAvoidanceBonus;
  const adjustedWeakness = totalWeakness + weaknessCountPenalty;

  const ratio = adjustedDefense / (adjustedDefense + adjustedWeakness);
  const finalScore = 10 * ratio;

  // Generate HTML
  return `
        <div style="background: white; padding: 1em; border-radius: 0.5em; margin-top: 1em; font-size: 0.9em; text-align: left; max-height: 400px; overflow-y: auto;">
            <h4 style="margin: 0 0 0.5em 0; color: #4a5568;">📊 Calculation Breakdown</h4>
            
            <div style="margin-bottom: 1em;">
                <strong style="color: #22c55e;">✅ Team Immunities (${immunities.length}):</strong>
                <div style="margin-left: 1em; color: #666;">${immunities.length > 0 ? immunities.join(", ") : "None"}</div>
                <div style="margin-left: 1em; font-size: 0.85em;">Score: ${immunityScore.toFixed(1)} points</div>
            </div>
            
            <div style="margin-bottom: 1em;">
                <strong style="color: #3b82f6;">🛡️ Team x0.25 Resistances (${resistances025.length}):</strong>
                <div style="margin-left: 1em; color: #666;">${resistances025.length > 0 ? resistances025.join(", ") : "None"}</div>
                <div style="margin-left: 1em; font-size: 0.85em;">Score: ${resistance025Score.toFixed(1)} points</div>
            </div>
            
            <div style="margin-bottom: 1em;">
                <strong style="color: #3b82f6;">🛡️ Team x0.5 Resistances (${resistances05.length}):</strong>
                <div style="margin-left: 1em; color: #666;">${resistances05.length > 0 ? resistances05.join(", ") : "None"}</div>
                <div style="margin-left: 1em; font-size: 0.85em;">Score: ${resistance05Score.toFixed(1)} points</div>
            </div>
            
            <div style="margin-bottom: 1em;">
                <strong style="color: #f59e0b;">⚠️ Team x2 Weaknesses (${weaknesses2x.length}):</strong>
                <div style="margin-left: 1em; color: #666;">${weaknesses2x.length > 0 ? weaknesses2x.join(", ") : "None"}</div>
                <div style="margin-left: 1em; font-size: 0.85em;">Penalty: ${weakness2xPenalty.toFixed(1)} points</div>
            </div>
            
            <div style="margin-bottom: 1em;">
                <strong style="color: #ef4444;">❌ Team x4 Weaknesses (${weaknesses4x.length}):</strong>
                <div style="margin-left: 1em; color: #666;">${weaknesses4x.length > 0 ? weaknesses4x.join(", ") : "None"}</div>
                <div style="margin-left: 1em; font-size: 0.85em;">Penalty: ${weakness4xPenalty.toFixed(1)} points</div>
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1em 0;">
            
            <div style="margin-bottom: 0.5em;">
                <strong>Bonuses & Penalties:</strong>
            </div>
            <div style="margin-left: 1em; font-size: 0.85em; color: #666;">
                • Immunity count bonus: +${immunityCountBonus.toFixed(1)}<br>
                • Weakness count penalty: -${weaknessCountPenalty.toFixed(1)}<br>
                • Common type avoidance: +${commonTypeAvoidanceBonus.toFixed(1)}
            </div>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 1em 0;">
            
            <div style="font-weight: bold;">
                <div>Total Defense: ${adjustedDefense.toFixed(1)} points</div>
                <div>Total Weakness: ${adjustedWeakness.toFixed(1)} points</div>
                <div style="margin-top: 0.5em; color: #4a5568;">Final Score: ${adjustedDefense.toFixed(1)} / (${adjustedDefense.toFixed(1)} + ${adjustedWeakness.toFixed(1)}) × 10 = <span style="color: #667eea;">${finalScore.toFixed(1)}/10</span></div>
            </div>
        </div>
    `;
}

/**
 * DISPLAY: Render Pokémon data to the page
 *
 * This function generates HTML for displaying:
 * - Pokémon image and basic info (ID, height, weight, abilities)
 * - Types with color-coded badges
 * - Type effectiveness (weaknesses, resistances, immunities)
 * - Base stats with visual representation
 * - Team recommendation button
 *
 * @param {Object} data - Pokémon data object from PokéAPI
 * @param {Array<Object>} typeData - Type effectiveness data
 * @param {string} [targetId="pokemon-data"] - DOM element ID to render into
 */
function displayPokemonData(data, typeData, targetId = "pokemon-data") {
  // Hide previous messages
  const errorMessage = document.getElementById("error-message");
  const loadingMessage = document.getElementById("loading-message");
  if (errorMessage) errorMessage.classList.add("hidden");
  if (loadingMessage) loadingMessage.classList.add("hidden");

  // ====== Format Abilities ======
  // Pokémon can have 1-3 abilities; join with comma
  const abilities = data.abilities
    .map((abilityInfo) => abilityInfo.ability.name)
    .join(", ");

  // ====== Format Stats ======
  // Create list items for each stat (HP, Attack, Defense, etc.)
  const statsHTML = data.stats
    .map((stat) => {
      const statName = stat.stat.name.replace("-", " "); // "special-attack" -> "special attack"
      return `<li><strong>${statName}:</strong> <span>${stat.base_stat}</span></li>`;
    })
    .join("");

  // ====== Format Types ======
  // Create badge for each type (usually 1-2)
  const typesHTML = data.types
    .map((typeInfo) => `<li>${typeInfo.type.name}</li>`)
    .join("");

  // ====== Calculate Type Effectiveness ======
  const effectiveness = calculateTypeEffectiveness(typeData);

  // ====== Separate into Weaknesses, Resistances, Immunities ======
  const weaknesses = Object.entries(effectiveness)
    .filter(([_, mult]) => mult > 1)
    .sort((a, b) => b[1] - a[1]); // Sort by damage multiplier descending

  const resistances = Object.entries(effectiveness)
    .filter(([_, mult]) => mult < 1 && mult > 0)
    .sort((a, b) => a[1] - b[1]); // Sort by damage multiplier ascending

  const immunities = Object.entries(effectiveness).filter(
    ([_, mult]) => mult === 0,
  );

  // ====== Format Effectiveness HTML ======
  const weaknessHTML =
    weaknesses.length > 0
      ? weaknesses
          .map(([type, mult]) => `<li class="weakness">${type} (×${mult})</li>`)
          .join("")
      : '<li class="neutral">None</li>';

  const resistanceHTML =
    resistances.length > 0
      ? resistances
          .map(
            ([type, mult]) => `<li class="resistance">${type} (×${mult})</li>`,
          )
          .join("")
      : '<li class="neutral">None</li>';

  const immunityHTML =
    immunities.length > 0
      ? immunities
          .map(([type]) => `<li class="immunity">${type} (×0)</li>`)
          .join("")
      : "";

  // ====== Calculate Weakness Value ======
  const weaknessValue = calculateWeaknessValue(effectiveness);

  // ====== Generate Full Pokemon Card HTML ======
  const pokemonInfo = `
        <div class="pokemon-card">
            <div class="pokemon-left">
                <h2>${data.name}</h2>
                <img src="${data.sprites.front_default}" alt="${data.name}" class="pokemon-image">
                <div id="pokemon-info">
                    <p><strong>ID:</strong> #${data.id}</p>
                    <p><strong>Height:</strong> ${(data.height / 10).toFixed(1)} m</p>
                    <p><strong>Weight:</strong> ${(data.weight / 10).toFixed(1)} kg</p>
                    <p><strong>Abilities:</strong> ${abilities}</p>
                    <p><strong>Weakness Value:</strong> <span class="weakness-value" title="Higher is better (0-10 scale)">${weaknessValue}/10</span></p>
                </div>
                <h3>Team Recommendations</h3>
                <button class="recommend-btn">Show Team Recommendations</button>
                <div class="team-recommendations"></div>
            </div>
            <div class="pokemon-right">
                <h3>Types</h3>
                <ul id="pokemon-types">
                    ${typesHTML}
                </ul>
                <h3>Type Effectiveness</h3>
                <div id="type-effectiveness">
                    <h4>Weaknesses</h4>
                    <ul id="pokemon-weaknesses">
                        ${weaknessHTML}
                    </ul>
                    <h4>Resistances</h4>
                    <ul id="pokemon-resistances">
                        ${resistanceHTML}
                    </ul>
                    ${immunities.length > 0 ? `<h4>Immunities</h4><ul id="pokemon-immunities">${immunityHTML}</ul>` : ""}
                </div>
                <h3>Stats</h3>
                <ul id="pokemon-stats">
                    ${statsHTML}
                </ul>
                <div class="team-recommendations-right"></div>
            </div>
        </div>
    `;

  // ====== Render to DOM ======
  const target = document.getElementById(targetId);
  if (!target) {
    console.error(`Target element with ID "${targetId}" not found`);
    showError("Error displaying Pokémon data.");
    return;
  }

  target.innerHTML = pokemonInfo;

  // ====== Store Profile for Comparison ======
  // Extract important data for comparison summary
  const profile = extractProfile(data, typeData, effectiveness);
  if (targetId === "pokemon-data") {
    leftProfile = profile;
  } else if (targetId === "pokemon-data-2") {
    rightProfile = profile;
  }

  // Update comparison summary if both are loaded
  renderComparisonSummary();

  // ====== Wire Up Team Recommendations Button ======
  // This needs to happen after DOM rendering
  const card = target.querySelector(".pokemon-card");
  if (card) {
    const recBtn = card.querySelector(".recommend-btn");
    const leftContainer = card.querySelector(".team-recommendations");
    const rightContainer = card.querySelector(".team-recommendations-right");

    if (recBtn && leftContainer) {
      recBtn.addEventListener("click", async () => {
        // Disable button and show loading state
        recBtn.disabled = true;
        recBtn.textContent = "Loading…";

        // Initialize containers with headers
        leftContainer.innerHTML =
          '<h4>Recommended Team Members</h4><div class="team-grid" id="left-grid"></div>';
        if (rightContainer) {
          rightContainer.innerHTML =
            '<h4>Recommended Team Members</h4><div class="team-grid" id="right-grid"></div>';
        }

        const leftGrid = leftContainer.querySelector("#left-grid");
        const rightGrid = rightContainer
          ? rightContainer.querySelector("#right-grid")
          : null;

        // Set up click handlers for recommended Pokémon
        // Clicking a recommendation adds it to the opposite panel
        const oppositeTarget =
          targetId === "pokemon-data" ? "pokemon-data-2" : "pokemon-data";
        const handleGridClick = (evt) => {
          const item = evt.target.closest(".team-member");
          if (!item) return;
          const name = item.getAttribute("data-name");
          if (name) fetchPokemonData(name, oppositeTarget);
        };
        const handleGridKeydown = (evt) => {
          // Handle Enter and Space keys for accessibility
          const isEnter = evt.key === "Enter";
          const isSpace =
            evt.key === " " || evt.key === "Spacebar" || evt.code === "Space";
          if (!isEnter && !isSpace) return;
          const item = evt.target.closest(".team-member");
          if (!item) return;
          evt.preventDefault();
          const name = item.getAttribute("data-name");
          if (name) fetchPokemonData(name, oppositeTarget);
        };
        leftGrid.addEventListener("click", handleGridClick);
        leftGrid.addEventListener("keydown", handleGridKeydown);
        if (rightGrid) {
          rightGrid.addEventListener("click", handleGridClick);
          rightGrid.addEventListener("keydown", handleGridKeydown);
        }

        // Stream recommendations as they load (improves perceived performance)
        let count = 0;
        const recommendations = [];
        const teamEffectivenessData = [effectiveness]; // Start with current Pokémon

        try {
          for await (const rec of getTeamRecommendationsStream(
            data,
            typeData,
          )) {
            count++;
            recommendations.push(rec);
            const recHTML = `
                            <div class="team-member" data-name="${rec.name}" tabindex="0" role="button" aria-label="Add ${rec.name} to comparison" aria-keyshortcuts="Enter Space">
                                <img src="${rec.sprite}" alt="${rec.name}" class="team-member-image">
                                <div class="team-member-name">${rec.name}</div>
                                <div class="team-member-reason">Covers: ${rec.coveredWeaknesses.join(", ")}</div>
                                <div class="team-member-wv" style="font-size: 0.8em; color: #666;">WV: ${rec.weaknessValue ? rec.weaknessValue.toFixed(1) : "N/A"}/10</div>
                            </div>
                        `;

            // First 3 recommendations go to left, rest to right
            if (count <= 3) {
              leftGrid.innerHTML += recHTML;
            } else if (rightGrid) {
              rightGrid.innerHTML += recHTML;
            }

            // Collect effectiveness data for team score calculation
            if (rec.effectivenessData) {
              teamEffectivenessData.push(rec.effectivenessData);
            }
          }

          // Calculate and display combined team score
          if (count > 0 && recommendations.length > 0) {
            // Fetch effectiveness data for all recommendations
            const recEffectivenessPromises = recommendations
              .slice(0, 3)
              .map(async (rec) => {
                try {
                  const recData = await fetchJSON(
                    `https://pokeapi.co/api/v2/pokemon/${rec.name}`,
                  );
                  const recTypeData = await Promise.all(
                    recData.types.map((t) => fetchJSON(t.type.url)),
                  );
                  return calculateTypeEffectiveness(recTypeData);
                } catch (e) {
                  console.warn(
                    `Could not fetch effectiveness for ${rec.name}:`,
                    e,
                  );
                  return null;
                }
              });

            const recEffectiveness = await Promise.all(
              recEffectivenessPromises,
            );
            const validRecEffectiveness = recEffectiveness.filter(
              (e) => e !== null,
            );
            const fullTeamEffectiveness = [
              effectiveness,
              ...validRecEffectiveness,
            ];

            const combinedScore = calculateCombinedTeamScore(
              fullTeamEffectiveness,
            );

            const teamScoreHTML = `
                            <div style="margin-top: 1em; padding: 1em; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 0.5em; text-align: center;">
                                <h4 style="color: white; margin: 0 0 0.5em 0;">🛡️ Combined Team Score</h4>
                                <p style="font-size: 2em; font-weight: bold; color: white; margin: 0;">${combinedScore.toFixed(1)}/10</p>
                                <p style="font-size: 0.85em; color: rgba(255,255,255,0.9); margin: 0.5em 0 0 0;">Team defensive synergy with top 3 picks</p>
                                <button 
                                    id="show-team-calc-${targetId}" 
                                    style="margin-top: 0.5em; padding: 0.5em 1em; background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.4); border-radius: 0.5em; cursor: pointer; font-size: 0.9em;"
                                    onmouseover="this.style.background='rgba(255,255,255,0.3)'"
                                    onmouseout="this.style.background='rgba(255,255,255,0.2)'"
                                >
                                    Show Calculations
                                </button>
                                <div id="team-calc-breakdown-${targetId}" style="display: none;"></div>
                            </div>
                        `;

            leftContainer.insertAdjacentHTML("beforeend", teamScoreHTML);

            // Add event listener for show calculations button
            setTimeout(() => {
              const calcBtn = document.getElementById(
                `show-team-calc-${targetId}`,
              );
              const calcBreakdown = document.getElementById(
                `team-calc-breakdown-${targetId}`,
              );
              if (calcBtn && calcBreakdown) {
                calcBtn.addEventListener("click", () => {
                  if (calcBreakdown.style.display === "none") {
                    calcBreakdown.innerHTML = generateTeamScoreBreakdown(
                      fullTeamEffectiveness,
                    );
                    calcBreakdown.style.display = "block";
                    calcBtn.textContent = "Hide Calculations";
                  } else {
                    calcBreakdown.style.display = "none";
                    calcBtn.textContent = "Show Calculations";
                  }
                });
              }
            }, 0);
          }

          // Show message if no recommendations found
          if (count === 0) {
            leftContainer.innerHTML =
              '<div class="neutral">No recommendations found.</div>';
            if (rightContainer) rightContainer.innerHTML = "";
          }
        } catch (error) {
          console.error("Error generating team recommendations:", error);
          showError(
            "Could not generate team recommendations. Please try again.",
          );
          leftContainer.innerHTML =
            '<div class="neutral">Error loading recommendations</div>';
        }

        // Re-enable button
        recBtn.textContent = "Show Team Recommendations";
        recBtn.disabled = false;
      });
    }
  }
}

/**
 * UTILITY: Extract minimal profile data from full Pokémon data
 *
 * This creates a lightweight version of Pokémon data for storage
 * and comparison, reducing memory usage
 *
 * @param {Object} data - Full Pokémon data from PokéAPI
 * @returns {Object} Simplified profile with essential data
 */
function extractProfile(data, typeData, effectiveness) {
  const weaknessValue = calculateWeaknessValue(effectiveness);
  return {
    name: data.name,
    id: data.id,
    types: data.types.map((t) => t.type.name),
    stats: Object.fromEntries(
      data.stats.map((s) => [s.stat.name, s.base_stat]),
    ),
    sprite: data.sprites.front_default,
    weaknessValue: parseFloat(weaknessValue),
  };
}

/**
 * GENERATOR: Stream team recommendations for a Pokémon
 *
 * This async generator function yields recommendations one at a time
 * using a multi-pass algorithm:
 *
 * Pass 1: Prioritize coverage of team weaknesses (best recommendations)
 * Pass 2: Cover any team weaknesses (medium recommendations)
 * Pass 3: Stat diversity fallback (filler recommendations)
 *
 * @async
 * @generator
 * @param {Object} pokemonData - Pokémon data object
 * @param {Array<Object>} typeData - Type effectiveness data
 * @yields {Object} Recommendation objects with name, sprite, coverage
 */
async function* getTeamRecommendationsStream(pokemonData, typeData) {
  // Get selected generations
  const selectedGens = getSelectedGenerations();

  // Calculate what this Pokémon is weak to and immune to
  const effectiveness = calculateTypeEffectiveness(typeData);
  const mainWeaknesses = new Set(
    Object.entries(effectiveness)
      .filter(([_, mult]) => mult > 1)
      .map(([type]) => type),
  );
  const mainImmunities = new Set(
    Object.entries(effectiveness)
      .filter(([_, mult]) => mult === 0)
      .map(([type]) => type),
  );

  // If no weaknesses, no recommendations needed
  if (mainWeaknesses.size === 0) return;

  /**
   * Helper: Convert stats array to vector for distance calculation
   * Enables stat diversity scoring
   */
  const buildStatVector = (pk) => {
    const order = [
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed",
    ];
    const vec = new Array(order.length).fill(0);
    try {
      pk.stats.forEach((s) => {
        const idx = order.indexOf(s.stat.name);
        if (idx >= 0) vec[idx] = s.base_stat || 0;
      });
    } catch (e) {
      console.warn("Error building stat vector:", e);
    }
    return vec;
  };

  /**
   * Helper: Calculate Euclidean distance between stat vectors
   * Used to find diverse team members
   */
  const dist = (a, b) =>
    a.reduce((sum, v, i) => sum + Math.pow(v - (b[i] || 0), 2), 0);

  /**
   * Helper: Calculate average vector from multiple vectors
   * Used to find team stat balance
   */
  const avgVector = (vectors) => {
    if (!vectors.length) return [0, 0, 0, 0, 0, 0];
    const acc = new Array(6).fill(0);
    vectors.forEach((v) => v.forEach((val, i) => (acc[i] += val)));
    return acc.map((x) => x / vectors.length);
  };

  try {
    // ====== FETCH CANDIDATES ======
    // Fetch Pokémon types that cover this Pokémon's weaknesses
    // Limits API calls by getting candidates from type endpoints
    const typeEndpoints = await Promise.all(
      [...mainWeaknesses].map((w) =>
        fetchJSON(`https://pokeapi.co/api/v2/type/${w}`),
      ),
    );
    const candidateNames = new Set();
    typeEndpoints.forEach((te) => {
      // Get first 60 Pokémon of each type (PokéAPI limits per type)
      te.pokemon
        .slice(0, 60)
        .forEach((p) => candidateNames.add(p.pokemon.name));
    });

    // Remove the current Pokémon (don't recommend it to itself)
    candidateNames.delete(pokemonData.name.toLowerCase());

    // Shuffle for variety in recommendations
    const shuffled = Array.from(candidateNames).sort(() => Math.random() - 0.5);

    // ====== TRACKING VARIABLES ======
    const usedChains = new Set(); // Evolution chains already used
    const selectedRecs = [];
    const selectedVectors = [];
    const typeCounts = new Map(); // Track type frequency
    const coveredAttackTypes = new Set(); // Already covered weaknesses
    const teamWeaknesses = new Set([...mainWeaknesses]);
    const teamImmunities = new Set(); // Track immunities gained

    const incrementTypeCounts = (types) => {
      types.forEach((t) => typeCounts.set(t, (typeCounts.get(t) || 0) + 1));
    };

    const respectsTypeLimit = (types) => {
      // Allow max 2 of same type in recommendations
      for (const t of types) {
        if ((typeCounts.get(t) || 0) >= 2) return false;
      }
      return true;
    };

    // ====== PASS 1: NEW COVERAGE ======
    // Prioritize Pokémon that cover weaknesses not yet covered
    for (const name of shuffled) {
      if (selectedRecs.length >= 5) break; // Max 5 recommendations
      try {
        const baseData = await fetchJSON(
          `https://pokeapi.co/api/v2/pokemon/${name}`,
        );

        // Get evolution chain to find final form
        const species = await fetchJSON(baseData.species.url);

        // Filter by generation
        const genNumber = getGenerationNumber(species.id);
        if (!selectedGens.has(genNumber)) continue;

        const chainUrl = species.evolution_chain?.url;
        if (!chainUrl || usedChains.has(chainUrl)) continue;

        const chain = await fetchJSON(chainUrl);
        let node = chain.chain;
        let finalSpeciesName = node.species.name;

        // Traverse evolution chain to final form
        while (node.evolves_to && node.evolves_to.length > 0) {
          node = node.evolves_to[0];
          finalSpeciesName = node.species.name;
        }

        const finalData =
          finalSpeciesName === baseData.name
            ? baseData
            : await fetchJSON(
                `https://pokeapi.co/api/v2/pokemon/${finalSpeciesName}`,
              );
        const finalTypes = finalData.types.map((t) => t.type.name);

        if (!respectsTypeLimit(finalTypes)) continue;

        // Calculate what this candidate resists/is immune to
        const typeDatas = await Promise.all(
          finalTypes.map((t) =>
            fetchJSON(`https://pokeapi.co/api/v2/type/${t}`),
          ),
        );
        const eff = calculateTypeEffectiveness(typeDatas);
        const resistances = new Set(
          Object.entries(eff)
            .filter(([_, mult]) => mult < 1 && mult > 0)
            .map(([type]) => type),
        );
        const immunities = new Set(
          Object.entries(eff)
            .filter(([_, mult]) => mult === 0)
            .map(([type]) => type),
        );
        const resistOrImmune = new Set([...resistances, ...immunities]);
        const covers = [...resistOrImmune].filter((t) => teamWeaknesses.has(t));
        const newCoverage = covers.filter((t) => !coveredAttackTypes.has(t));
        const newImmunities = [...immunities].filter(
          (t) => teamWeaknesses.has(t) && !teamImmunities.has(t),
        );

        // Calculate score: prioritize immunities over resistances
        let coverageScore = 0;
        newImmunities.forEach(() => (coverageScore += 3)); // Immunities worth 3 points
        newCoverage
          .filter((t) => !immunities.has(t))
          .forEach(() => (coverageScore += 1)); // Resistances worth 1 point

        // Bonus for total immunity count (more immunities = better)
        const immunityCountBonus = immunities.size * 1.5;

        // Calculate weakness penalty (fewer weaknesses = better)
        const candWeaknesses = Object.entries(eff)
          .filter(([_, mult]) => mult > 1)
          .map(([type]) => type);
        const weaknessPenalty = candWeaknesses.length * 0.5;

        // Calculate weakness value as primary scoring factor
        const candWeaknessValue = parseFloat(calculateWeaknessValue(eff));
        const weaknessValueBonus = candWeaknessValue * 2; // Scale weakness value (0-10 -> 0-20 points)

        // Accept if provides NEW coverage
        if (newCoverage.length > 0 || newImmunities.length > 0) {
          usedChains.add(chainUrl);
          newCoverage.forEach((t) => coveredAttackTypes.add(t));
          newImmunities.forEach((t) => teamImmunities.add(t));
          candWeaknesses.forEach((t) => teamWeaknesses.add(t));
          incrementTypeCounts(finalTypes);
          const vec = buildStatVector(finalData);
          selectedVectors.push(vec);

          const rec = {
            name: finalData.name,
            sprite: finalData.sprites.front_default,
            score: Math.max(
              0,
              coverageScore +
                immunityCountBonus +
                weaknessValueBonus -
                weaknessPenalty,
            ),
            coveredWeaknesses: newCoverage,
            immunities: [...newImmunities],
            totalImmunities: immunities.size,
            weaknessCount: candWeaknesses.length,
            weaknessValue: candWeaknessValue,
            types: finalTypes,
          };
          selectedRecs.push(rec);
          yield rec;
        }
      } catch (e) {
        console.debug(`Skipped candidate ${name}:`, e.message);
        continue;
      }
    }

    // ====== PASS 2: ADDITIONAL COVERAGE ======
    // Fill remaining slots with Pokémon that cover ANY team weakness
    if (selectedRecs.length < 5) {
      for (const name of shuffled) {
        if (selectedRecs.length >= 5) break;
        try {
          const baseData = await fetchJSON(
            `https://pokeapi.co/api/v2/pokemon/${name}`,
          );
          const species = await fetchJSON(baseData.species.url);

          // Filter by generation
          const genNumber = getGenerationNumber(species.id);
          if (!selectedGens.has(genNumber)) continue;

          const chainUrl = species.evolution_chain?.url;
          if (!chainUrl || usedChains.has(chainUrl)) continue;

          const chain = await fetchJSON(chainUrl);
          let node = chain.chain;
          let finalSpeciesName = node.species.name;
          while (node.evolves_to && node.evolves_to.length > 0) {
            node = node.evolves_to[0];
            finalSpeciesName = node.species.name;
          }
          const finalData =
            finalSpeciesName === baseData.name
              ? baseData
              : await fetchJSON(
                  `https://pokeapi.co/api/v2/pokemon/${finalSpeciesName}`,
                );
          const finalTypes = finalData.types.map((t) => t.type.name);
          if (!respectsTypeLimit(finalTypes)) continue;

          const typeDatas = await Promise.all(
            finalTypes.map((t) =>
              fetchJSON(`https://pokeapi.co/api/v2/type/${t}`),
            ),
          );
          const eff = calculateTypeEffectiveness(typeDatas);
          const resistances = new Set(
            Object.entries(eff)
              .filter(([_, mult]) => mult < 1 && mult > 0)
              .map(([type]) => type),
          );
          const immunities = new Set(
            Object.entries(eff)
              .filter(([_, mult]) => mult === 0)
              .map(([type]) => type),
          );
          const resistOrImmune = new Set([...resistances, ...immunities]);
          const covers = [...resistOrImmune].filter((t) =>
            teamWeaknesses.has(t),
          );
          if (covers.length === 0) continue;

          // Calculate score with immunity preference and weakness penalty
          let coverageScore = 0;
          [...immunities]
            .filter((t) => teamWeaknesses.has(t))
            .forEach(() => (coverageScore += 1.5));
          covers
            .filter((t) => !immunities.has(t))
            .forEach(() => (coverageScore += 0.5));

          // Bonus for total immunity count (more immunities = better)
          const immunityCountBonus = immunities.size * 1.0;

          const candWeaknesses = Object.entries(eff)
            .filter(([_, mult]) => mult > 1)
            .map(([type]) => type);
          const weaknessPenalty = candWeaknesses.length * 0.3;

          // Calculate weakness value as primary scoring factor
          const candWeaknessValue = parseFloat(calculateWeaknessValue(eff));
          const weaknessValueBonus = candWeaknessValue * 1.5; // Scale for Pass 2

          usedChains.add(chainUrl);
          [...immunities]
            .filter((t) => teamWeaknesses.has(t))
            .forEach((t) => teamImmunities.add(t));
          candWeaknesses.forEach((t) => teamWeaknesses.add(t));
          incrementTypeCounts(finalTypes);
          const vec = buildStatVector(finalData);
          selectedVectors.push(vec);
          const rec = {
            name: finalData.name,
            sprite: finalData.sprites.front_default,
            score: Math.max(
              0,
              coverageScore +
                immunityCountBonus +
                weaknessValueBonus -
                weaknessPenalty,
            ),
            coveredWeaknesses: covers,
            immunities: [...immunities].filter((t) => teamWeaknesses.has(t)),
            totalImmunities: immunities.size,
            weaknessCount: candWeaknesses.length,
            weaknessValue: candWeaknessValue,
            types: finalTypes,
          };
          selectedRecs.push(rec);
          yield rec;
        } catch (e) {
          console.debug(`Skipped candidate ${name}:`, e.message);
          continue;
        }
      }
    }

    // ====== PASS 3: STAT DIVERSITY ======
    // Fill final slots with stat-diverse Pokémon
    if (selectedRecs.length < 5) {
      const meanVec = avgVector(selectedVectors);
      for (const name of shuffled) {
        if (selectedRecs.length >= 5) break;
        try {
          const baseData = await fetchJSON(
            `https://pokeapi.co/api/v2/pokemon/${name}`,
          );
          const species = await fetchJSON(baseData.species.url);

          // Filter by generation
          const genNumber = getGenerationNumber(species.id);
          if (!selectedGens.has(genNumber)) continue;

          const chainUrl = species.evolution_chain?.url;
          if (!chainUrl || usedChains.has(chainUrl)) continue;

          const chain = await fetchJSON(chainUrl);
          let node = chain.chain;
          let finalSpeciesName = node.species.name;
          while (node.evolves_to && node.evolves_to.length > 0) {
            node = node.evolves_to[0];
            finalSpeciesName = node.species.name;
          }
          const finalData =
            finalSpeciesName === baseData.name
              ? baseData
              : await fetchJSON(
                  `https://pokeapi.co/api/v2/pokemon/${finalSpeciesName}`,
                );
          const finalTypes = finalData.types.map((t) => t.type.name);
          if (!respectsTypeLimit(finalTypes)) continue;

          const vec = buildStatVector(finalData);
          const diversityScore = dist(vec, meanVec);
          if (diversityScore <= 0) continue;

          usedChains.add(chainUrl);
          incrementTypeCounts(finalTypes);
          selectedVectors.push(vec);
          const rec = {
            name: finalData.name,
            sprite: finalData.sprites.front_default,
            score: Math.min(2, Math.floor(diversityScore / 120)),
            coveredWeaknesses: [],
            types: finalTypes,
          };
          selectedRecs.push(rec);
          yield rec;
        } catch (e) {
          console.debug(`Skipped candidate ${name}:`, e.message);
          continue;
        }
      }
    }
  } catch (error) {
    console.error("Error generating team recommendations:", error);
    showError(`Could not generate recommendations: ${error.message}`);
  }
}

/**
 * UTILITY: Get all team recommendations (non-streaming version)
 * Collects all results from the generator into an array
 *
 * @async
 * @param {Object} pokemonData - Pokémon data object
 * @param {Array<Object>} typeData - Type effectiveness data
 * @returns {Promise<Array>} Array of recommendation objects
 */
async function getTeamRecommendations(pokemonData, typeData) {
  const recommendations = [];
  try {
    for await (const rec of getTeamRecommendationsStream(
      pokemonData,
      typeData,
    )) {
      recommendations.push(rec);
    }
  } catch (error) {
    console.error("Error in getTeamRecommendations:", error);
  }
  return recommendations;
}

/**
 * DISPLAY: Render comparison summary of two Pokémon
 *
 * Shows a side-by-side analysis including:
 * - Shared weaknesses and resistances
 * - Unique strengths and weaknesses for each
 * - Stat comparison with visual bars
 *
 * This function builds complex HTML asynchronously as type data loads
 */
let comparisonEffectivenessData = {}; // Store effectiveness data for breakdown access

function renderComparisonSummary() {
  const container = document.getElementById("comparison-summary");
  if (!container) {
    console.warn("Comparison summary container not found");
    return;
  }

  // Show placeholder if only one or zero Pokémon loaded
  if (!leftProfile || !rightProfile) {
    container.innerHTML = `
            <div class="comparison-summary">
                <div class="comparison-summary-title">Comparison Summary</div>
                <div class="summary-section">
                    Search two Pokémon to see a quick comparison of types and stats.
                </div>
            </div>
        `;
    return;
  }

  // Fetch type data and build comparison asynchronously
  Promise.all([
    ...leftProfile.types.map((t) =>
      fetchJSON(`https://pokeapi.co/api/v2/type/${t}`),
    ),
  ])
    .then((leftTypeData) => {
      // Calculate effectiveness for left Pokémon
      const leftEff = calculateTypeEffectiveness(leftTypeData);
      const leftWeak = new Set();
      const leftResist = new Set();
      Object.entries(leftEff).forEach(([type, mult]) => {
        if (mult > 1) leftWeak.add(type);
        if (mult < 1 && mult > 0) leftResist.add(type);
      });

      // Now fetch right Pokémon's type data
      return Promise.all([
        ...rightProfile.types.map((t) =>
          fetchJSON(`https://pokeapi.co/api/v2/type/${t}`),
        ),
      ]).then((rightTypeData) => {
        // Calculate effectiveness for right Pokémon
        const rightEff = calculateTypeEffectiveness(rightTypeData);
        const rightWeak = new Set();
        const rightResist = new Set();
        Object.entries(rightEff).forEach(([type, mult]) => {
          if (mult > 1) rightWeak.add(type);
          if (mult < 1 && mult > 0) rightResist.add(type);
        });

        // ====== COMPARE TYPE DATA ======
        // Find shared and unique weaknesses/resistances
        const sharedWeaknesses = [...leftWeak]
          .filter((t) => rightWeak.has(t))
          .sort();
        const leftUniqueWeak = [...leftWeak]
          .filter((t) => !rightWeak.has(t))
          .sort();
        const rightUniqueWeak = [...rightWeak]
          .filter((t) => !leftWeak.has(t))
          .sort();

        const sharedResistances = [...leftResist]
          .filter((t) => rightResist.has(t))
          .sort();
        const leftUniqueResist = [...leftResist]
          .filter((t) => !rightResist.has(t))
          .sort();
        const rightUniqueResist = [...rightResist]
          .filter((t) => !leftResist.has(t))
          .sort();

        // ====== CALCULATE COMBINED TEAM SCORE ======
        const combinedTeamScore = calculateCombinedTeamScore([
          leftEff,
          rightEff,
        ]);

        // Store effectiveness data for button access
        comparisonEffectivenessData = { left: leftEff, right: rightEff };

        // ====== COMPARE STATS ======
        const statNames = [
          "hp",
          "attack",
          "defense",
          "special-attack",
          "special-defense",
          "speed",
        ];

        // Find max stat value across both Pokémon for bar scaling
        const maxStat = Math.max(
          ...statNames.map((name) =>
            Math.max(
              leftProfile.stats[name] ?? 0,
              rightProfile.stats[name] ?? 0,
            ),
          ),
        );

        // Generate HTML for each stat comparison
        const barRows = statNames
          .map((name) => {
            const l = leftProfile.stats[name] ?? 0;
            const r = rightProfile.stats[name] ?? 0;
            const lWidth = (l / maxStat) * 100;
            const rWidth = (r / maxStat) * 100;
            return `
                    <div class="stat-bar-row">
                        <div class="stat-name">${name}</div>
                        <div class="stat-bars">
                            <div class="bar bar-left" style="width: ${lWidth}%;" title="${l}"></div>
                            <span class="bar-label">${l}</span>
                        </div>
                        <div class="stat-bars">
                            <div class="bar bar-right" style="width: ${rWidth}%;" title="${r}"></div>
                            <span class="bar-label">${r}</span>
                        </div>
                    </div>
                `;
          })
          .join("");

        // ====== RENDER FINAL HTML ======
        container.innerHTML = `
                <div class="comparison-summary">
                    <div class="comparison-summary-title">Comparison Summary</div>
                    <div class="summary-grid">
                        <div class="summary-section">
                            <h3>Weakness Value: ${leftProfile.name}</h3>
                            <p class="weakness-value-large" style="font-size: 2em; font-weight: bold; color: ${leftProfile.weaknessValue >= 7 ? "#22c55e" : leftProfile.weaknessValue >= 5 ? "#f59e0b" : "#ef4444"};">${leftProfile.weaknessValue.toFixed(1)}/10</p>
                        </div>
                        <div class="summary-section">
                            <h3>Weakness Value: ${rightProfile.name}</h3>
                            <p class="weakness-value-large" style="font-size: 2em; font-weight: bold; color: ${rightProfile.weaknessValue >= 7 ? "#22c55e" : rightProfile.weaknessValue >= 5 ? "#f59e0b" : "#ef4444"};">${rightProfile.weaknessValue.toFixed(1)}/10</p>
                        </div>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-section summary-section--full">
                            <h3>🛡️ Combined Team Score</h3>
                            <p class="weakness-value-large" style="font-size: 2.5em; font-weight: bold; color: ${combinedTeamScore >= 7 ? "#22c55e" : combinedTeamScore >= 5 ? "#f59e0b" : "#ef4444"};">${combinedTeamScore.toFixed(1)}/10</p>
                            <p style="font-size: 0.9em; color: #666; margin-top: 0.5em;">Team defensive synergy (resistances cancel weaknesses)</p>
                            <button 
                                id="show-comparison-calc" 
                                style="margin-top: 0.5em; padding: 0.5em 1em; background: #667eea; color: white; border: none; border-radius: 0.5em; cursor: pointer; font-size: 0.9em;"
                                onmouseover="this.style.background='#5a67d8'"
                                onmouseout="this.style.background='#667eea'"
                            >
                                Show Calculations
                            </button>
                            <div id="comparison-calc-breakdown" style="display: none;"></div>
                        </div>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-section">
                            <h3>Shared Weaknesses</h3>
                            <ul class="type-list">${sharedWeaknesses.length ? sharedWeaknesses.map((t) => `<li class="type-badge weakness">${t}</li>`).join("") : '<li class="neutral">None</li>'}</ul>
                        </div>
                        <div class="summary-section">
                            <h3>Shared Resistances</h3>
                            <ul class="type-list">${sharedResistances.length ? sharedResistances.map((t) => `<li class="type-badge resistance">${t}</li>`).join("") : '<li class="neutral">None</li>'}</ul>
                        </div>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-section">
                            <h3>Unique Weaknesses: ${leftProfile.name}</h3>
                            <ul class="type-list">${leftUniqueWeak.length ? leftUniqueWeak.map((t) => `<li class="type-badge weakness">${t}</li>`).join("") : '<li class="neutral">None</li>'}</ul>
                        </div>
                        <div class="summary-section">
                            <h3>Unique Weaknesses: ${rightProfile.name}</h3>
                            <ul class="type-list">${rightUniqueWeak.length ? rightUniqueWeak.map((t) => `<li class="type-badge weakness">${t}</li>`).join("") : '<li class="neutral">None</li>'}</ul>
                        </div>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-section">
                            <h3>Unique Resistances: ${leftProfile.name}</h3>
                            <ul class="type-list">${leftUniqueResist.length ? leftUniqueResist.map((t) => `<li class="type-badge resistance">${t}</li>`).join("") : '<li class="neutral">None</li>'}</ul>
                        </div>
                        <div class="summary-section">
                            <h3>Unique Resistances: ${rightProfile.name}</h3>
                            <ul class="type-list">${rightUniqueResist.length ? rightUniqueResist.map((t) => `<li class="type-badge resistance">${t}</li>`).join("") : '<li class="neutral">None</li>'}</ul>
                        </div>
                    </div>
                    <div class="summary-grid">
                        <div class="summary-section summary-section--full">
                            <h3>Stats Comparison</h3>
                            <div class="stat-legend">
                                <span class="legend-item"><span class="legend-swatch" style="background: linear-gradient(135deg, #4da3ff 0%, #2a6bff 100%)"></span> ${leftProfile.name}</span>
                                <span class="legend-item"><span class="legend-swatch" style="background: linear-gradient(135deg, #ff9f1c 0%, #ff4040 100%)"></span> ${rightProfile.name}</span>
                            </div>
                            ${barRows}
                        </div>
                    </div>
                </div>
            `;

        // Add event listener for show calculations button
        setTimeout(() => {
          const calcBtn = document.getElementById("show-comparison-calc");
          const calcBreakdown = document.getElementById(
            "comparison-calc-breakdown",
          );
          if (calcBtn && calcBreakdown) {
            calcBtn.addEventListener("click", () => {
              if (calcBreakdown.style.display === "none") {
                // Use stored effectiveness data
                calcBreakdown.innerHTML = generateTeamScoreBreakdown([
                  comparisonEffectivenessData.left,
                  comparisonEffectivenessData.right,
                ]);
                calcBreakdown.style.display = "block";
                calcBtn.textContent = "Hide Calculations";
              } else {
                calcBreakdown.style.display = "none";
                calcBtn.textContent = "Show Calculations";
              }
            });
          }
        }, 0);
      });
    })
    .catch((error) => {
      console.error("Error rendering comparison summary:", error);
      showError("Could not load comparison data. Please try again.");
    });
}

/**
 * EVENT HANDLER: Left-side search button click
 * Fetches Pokémon from left search input and displays in left panel
 */
document.getElementById("fetch-button").addEventListener("click", () => {
  const pokemonName = document.getElementById("pokemon-name").value.trim();
  if (pokemonName) {
    fetchPokemonData(pokemonName, "pokemon-data");
  } else {
    showError("Please enter a Pokémon name or ID.");
  }
});

/**
 * EVENT HANDLER: Left-side search input Enter key
 * Allows users to press Enter instead of clicking button
 */
document
  .getElementById("pokemon-name")
  .addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      document.getElementById("fetch-button").click();
    }
  });

/**
 * EVENT HANDLER: Right-side search button click
 * Fetches Pokémon from right search input and displays in right panel
 */
const rightSearchBtn = document.getElementById("fetch-button-2");
const rightSearchInput = document.getElementById("pokemon-name-2");

if (rightSearchBtn && rightSearchInput) {
  rightSearchBtn.addEventListener("click", () => {
    const name = rightSearchInput.value.trim();
    if (name) {
      fetchPokemonData(name, "pokemon-data-2");
    } else {
      showError("Please enter a Pokémon name or ID to compare.");
    }
  });

  /**
   * EVENT HANDLER: Right-side search input Enter key
   * Allows users to press Enter instead of clicking button
   */
  rightSearchInput.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      rightSearchBtn.click();
    }
  });
} else {
  console.warn("Right search button or input element not found");
}

/**
 * UTILITY: Get selected generations from checkboxes
 * @returns {Set<number>} Set of selected generation numbers
 */
function getSelectedGenerations() {
  const checkboxes = document.querySelectorAll(".generation-filter:checked");
  return new Set(Array.from(checkboxes).map((cb) => parseInt(cb.value)));
}

/**
 * UTILITY: Determine generation number from Pokémon ID
 * @param {number} pokemonId - The Pokémon's national dex number
 * @returns {number} Generation number (1-9)
 */
function getGenerationNumber(pokemonId) {
  if (pokemonId <= 151) return 1;
  if (pokemonId <= 251) return 2;
  if (pokemonId <= 386) return 3;
  if (pokemonId <= 493) return 4;
  if (pokemonId <= 649) return 5;
  if (pokemonId <= 721) return 6;
  if (pokemonId <= 809) return 7;
  if (pokemonId <= 905) return 8;
  return 9;
}

/**
 * EVENT HANDLER: Select All Generations button
 */
const selectAllBtn = document.getElementById("select-all-gens");
if (selectAllBtn) {
  selectAllBtn.addEventListener("click", () => {
    const checkboxes = document.querySelectorAll(".generation-filter");
    const allChecked = Array.from(checkboxes).every((cb) => cb.checked);

    checkboxes.forEach((cb) => {
      cb.checked = !allChecked;
    });

    selectAllBtn.textContent = allChecked ? "Select All" : "Deselect All";
  });
}

/**
 * TEAM BUILDER: State and functionality
 */
const teamBuilder = {
  team: [null, null, null, null, null, null], // 6 slots
  selectedPokemonData: [null, null, null, null, null, null], // Full data for each slot

  /**
   * Initialize team builder UI
   */
  init() {
    this.renderTeamSlots();
    this.setupEventListeners();
    this.updateTeamScore();
  },

  /**
   * Render all 6 team slots
   */
  renderTeamSlots() {
    const container = document.getElementById("team-slots");
    if (!container) return;

    container.innerHTML = this.team
      .map((pokemon, index) => {
        if (pokemon && this.selectedPokemonData[index]) {
          const pokemonData = this.selectedPokemonData[index];
          // Collapsed view for selected Pokemon
          return `
                    <div class="bg-gray-100 rounded-lg p-4 relative">
                        <button 
                            class="absolute top-2 right-2 text-red-500 hover:text-red-700 font-bold text-lg"
                            onclick="teamBuilder.removePokemon(${index})"
                            title="Remove from team"
                        >
                            ✕
                        </button>
                        <div class="pr-8 text-center">
                            <img src="${pokemonData.data.sprites.front_default}" alt="${pokemon}" class="w-24 h-24 mx-auto">
                            <h4 class="font-bold text-lg capitalize mt-2">${pokemon}</h4>
                            <p class="text-sm text-gray-600">Slot ${index + 1}</p>
                            <button 
                                class="mt-2 text-blue-600 hover:text-blue-800 text-sm underline"
                                onclick="teamBuilder.expandSlot(${index})"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                `;
        } else {
          // Empty slot with search
          return `
                    <div class="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                        <label class="block text-sm font-semibold text-gray-700 mb-2">Slot ${index + 1}</label>
                        <input 
                            type="text" 
                            id="team-search-${index}" 
                            placeholder="Search Pokémon..."
                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-purple-500 transition"
                            onkeypress="if(event.key==='Enter') teamBuilder.searchAndAddPokemon(${index}, this.value)"
                        >
                        <button 
                            class="w-full mt-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                            onclick="teamBuilder.searchAndAddPokemon(${index}, document.getElementById('team-search-${index}').value)"
                        >
                            Add to Team
                        </button>
                        <div id="team-search-results-${index}"></div>
                    </div>
                `;
        }
      })
      .join("");
  },

  /**
   * Search for and add a Pokemon to a team slot
   */
  async searchAndAddPokemon(slotIndex, pokemonName) {
    if (!pokemonName.trim()) {
      alert("Please enter a Pokémon name or ID");
      return;
    }

    try {
      const data = await fetchJSON(
        `https://pokeapi.co/api/v2/pokemon/${pokemonName.toLowerCase()}`,
      );
      const typeData = await Promise.all(
        data.types.map((typeInfo) => fetchJSON(typeInfo.type.url)),
      );

      this.team[slotIndex] = data.name;
      this.selectedPokemonData[slotIndex] = {
        data,
        typeData,
        effectiveness: calculateTypeEffectiveness(typeData),
      };

      this.renderTeamSlots();
      this.updateTeamScore();
      this.updateRecommendations();
    } catch (error) {
      alert(
        `Could not find Pokémon "${pokemonName}". Please check the spelling.`,
      );
      console.error("Error searching for Pokémon:", error);
    }
  },

  /**
   * Remove a Pokemon from a team slot
   */
  removePokemon(slotIndex) {
    this.team[slotIndex] = null;
    this.selectedPokemonData[slotIndex] = null;
    this.renderTeamSlots();
    this.updateTeamScore();
    this.updateRecommendations();
  },

  /**
   * Expand a slot to show full Pokemon details
   */
  expandSlot(slotIndex) {
    const pokemonData = this.selectedPokemonData[slotIndex];
    if (!pokemonData) return;

    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto";
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    const { data, effectiveness } = pokemonData;
    const weaknessValue = calculateWeaknessValue(effectiveness);

    modal.innerHTML = `
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-2xl font-bold capitalize">${data.name}</h3>
                    <button onclick="this.closest('.fixed').remove()" class="text-2xl hover:text-gray-600">✕</button>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <img src="${data.sprites.front_default}" alt="${data.name}" class="w-48 h-48 mx-auto">
                        <p><strong>ID:</strong> #${data.id}</p>
                        <p><strong>Height:</strong> ${(data.height / 10).toFixed(1)} m</p>
                        <p><strong>Weight:</strong> ${(data.weight / 10).toFixed(1)} kg</p>
                        <p><strong>Weakness Value:</strong> <strong style="color: ${weaknessValue >= 7 ? "#22c55e" : weaknessValue >= 5 ? "#f59e0b" : "#ef4444"}">${weaknessValue}/10</strong></p>
                    </div>
                    
                    <div>
                        <h4 class="font-bold mb-2">Types</h4>
                        <div class="flex gap-2 mb-4">
                            ${data.types.map((t) => `<span class="px-3 py-1 bg-gray-200 rounded-full text-sm">${t.type.name}</span>`).join("")}
                        </div>
                        
                        <h4 class="font-bold mb-2">Type Effectiveness</h4>
                        ${this.getEffectivenessHTML(effectiveness)}
                    </div>
                </div>
                
                <button onclick="this.closest('.fixed').remove()" class="w-full mt-6 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                    Close
                </button>
            </div>
        `;

    document.body.appendChild(modal);
  },

  /**
   * Generate HTML for type effectiveness display
   */
  getEffectivenessHTML(effectiveness) {
    const weaknesses = Object.entries(effectiveness)
      .filter(([_, m]) => m > 1)
      .map(([t]) => t);
    const resistances = Object.entries(effectiveness)
      .filter(([_, m]) => m < 1 && m > 0)
      .map(([t]) => t);
    const immunities = Object.entries(effectiveness)
      .filter(([_, m]) => m === 0)
      .map(([t]) => t);

    return `
            ${immunities.length > 0 ? `<p><strong>Immunities:</strong> ${immunities.join(", ")}</p>` : ""}
            ${resistances.length > 0 ? `<p><strong>Resistances:</strong> ${resistances.join(", ")}</p>` : ""}
            ${weaknesses.length > 0 ? `<p><strong>Weaknesses:</strong> ${weaknesses.join(", ")}</p>` : ""}
        `;
  },

  /**
   * Update the combined team score
   */
  updateTeamScore() {
    const filledSlots = this.selectedPokemonData.filter((p) => p !== null);
    const scoreDisplay = document.getElementById("team-score-display");
    const summaryStats = document.getElementById("team-summary-stats");

    if (filledSlots.length < 2) {
      scoreDisplay.textContent = "-/10";
      scoreDisplay.style.color = "#999";
      summaryStats.innerHTML = `<p>Add 2+ team members to calculate team score</p>`;
      this.updateTeamComparisonSummary([]);
      return;
    }

    const teamEffectiveness = filledSlots.map((p) => p.effectiveness);
    const score = calculateCombinedTeamScore(teamEffectiveness);

    scoreDisplay.textContent = `${score.toFixed(1)}/10`;
    scoreDisplay.style.color =
      score >= 7 ? "#22c55e" : score >= 5 ? "#f59e0b" : "#ef4444";

    const teamNames = this.team
      .filter((p) => p)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(", ");
    summaryStats.innerHTML = `<p><strong>Current Team:</strong> ${teamNames}</p><p><strong>Size:</strong> ${filledSlots.length}/6</p>`;

    // Update team comparison summary
    this.updateTeamComparisonSummary(filledSlots);
  },

  /**
   * Update team comparison summary with stats
   */
  updateTeamComparisonSummary(filledSlots) {
    const container = document.getElementById("team-comparison-summary");
    if (!container) return;

    if (filledSlots.length === 0) {
      container.innerHTML =
        '<p class="text-gray-500">Add team members to see comparison</p>';
      return;
    }

    const statNames = [
      "hp",
      "attack",
      "defense",
      "special-attack",
      "special-defense",
      "speed",
    ];

    // Calculate stats for each Pokemon
    const teamStats = filledSlots.map((slot) => {
      const stats = {};
      statNames.forEach((name) => {
        stats[name] =
          slot.data.stats.find((s) => s.stat.name === name)?.base_stat || 0;
      });
      return { name: slot.data.name, stats };
    });

    // Calculate averages and find best/worst
    const comparisons = statNames.map((statName) => {
      const values = teamStats.map((p) => p.stats[statName]);
      const avg = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(
        1,
      );
      const max = Math.max(...values);
      const min = Math.min(...values);
      const best = teamStats.find((p) => p.stats[statName] === max).name;
      const worst = teamStats.find((p) => p.stats[statName] === min).name;
      const diff = max - min;

      return { statName, avg, max, min, diff, best, worst };
    });

    container.innerHTML = `
            <h4 class="font-bold text-gray-800 mb-4">📊 Team Comparison</h4>
            <div class="space-y-3">
                ${comparisons
                  .map(
                    (comp) => `
                    <div class="bg-white rounded-lg p-3 border border-gray-200">
                        <div class="flex justify-between items-center">
                            <strong class="capitalize">${comp.statName.replace("-", " ")}</strong>
                            <span class="text-sm text-gray-600">Avg: <span class="font-bold">${comp.avg}</span></span>
                        </div>
                        <div class="text-xs text-gray-600 mt-1">
                            <p>Best: <span class="font-semibold capitalize text-green-600">${comp.best}</span> (${comp.max})</p>
                            <p>Worst: <span class="font-semibold capitalize text-red-600">${comp.worst}</span> (${comp.min})</p>
                            <p>Difference: <span class="font-semibold">${comp.diff}</span></p>
                        </div>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `;
  },

  /**
   * Update recommendations based on current team
   */
  async updateRecommendations() {
    const filledSlots = this.selectedPokemonData.filter((p) => p !== null);
    const container = document.getElementById("team-recommendations-grid");

    if (filledSlots.length < 1) {
      container.innerHTML =
        '<p class="text-gray-500 col-span-full">Add a team member to see recommendations</p>';
      return;
    }

    container.innerHTML =
      '<p class="text-gray-500 col-span-full">Loading recommendations...</p>';

    try {
      // Get recommendations based on the first Pokemon on the team
      if (this.selectedPokemonData[0]) {
        const { data, typeData } = this.selectedPokemonData[0];
        const recs = await getTeamRecommendations(data, typeData);

        // Get selected generations from team builder filter
        const selectedGens = Array.from(
          document.querySelectorAll(".team-builder-gen-filter:checked"),
        ).map((cb) => parseInt(cb.value));
        const selectedGenSet = new Set(selectedGens);

        // Get already-added Pokemon names (lowercase for comparison)
        const addedPokemonNames = new Set(
          this.team.filter((p) => p).map((p) => p.toLowerCase()),
        );

        // Filter recommendations to exclude already-added Pokemon and respect generation filter
        const filteredRecs = recs.filter((rec) => {
          const recGen = getGenerationNumber(rec.id);
          const isNotAdded = !addedPokemonNames.has(rec.name.toLowerCase());
          const isInSelectedGen = selectedGenSet.has(recGen);
          return isNotAdded && isInSelectedGen;
        });

        if (filteredRecs.length === 0) {
          container.innerHTML =
            '<p class="text-gray-500 col-span-full">No recommendations found matching your filters</p>';
          return;
        }

        container.innerHTML = filteredRecs
          .slice(0, 5)
          .map(
            (rec) => `
                    <div class="bg-white rounded-lg p-3 text-center border hover:shadow-lg transition cursor-pointer"
                         onclick="teamBuilder.searchAndAddPokemon(${this.team.indexOf(null)}, '${rec.name}')"
                         title="Click to add to team">
                        <img src="${rec.sprite}" alt="${rec.name}" class="w-16 h-16 mx-auto">
                        <p class="font-bold capitalize text-sm mt-1">${rec.name}</p>
                        <p class="text-xs text-gray-600">WV: ${rec.weaknessValue ? rec.weaknessValue.toFixed(1) : "N/A"}/10</p>
                    </div>
                `,
          )
          .join("");
      }
    } catch (error) {
      console.error("Error loading recommendations:", error);
      container.innerHTML =
        '<p class="text-red-500 col-span-full">Error loading recommendations</p>';
    }
  },

  /**
   * Setup event listeners for team builder modal
   */
  setupEventListeners() {
    const openBtn = document.getElementById("open-team-builder");
    const closeBtn = document.getElementById("close-team-builder");
    const closeBtnFooter = document.getElementById("close-team-builder-btn");
    const modal = document.getElementById("team-builder-modal");

    if (openBtn) {
      openBtn.addEventListener("click", () => {
        modal.classList.remove("hidden");
        this.init();
        // Setup calc button after modal is shown and elements exist
        setTimeout(() => this.setupCalculationsButton(), 100);
        // Setup generation filter listeners
        this.setupGenerationFilterListeners();
      });
    }

    if (closeBtn || closeBtnFooter) {
      const close = () => modal.classList.add("hidden");
      if (closeBtn) closeBtn.addEventListener("click", close);
      if (closeBtnFooter) closeBtnFooter.addEventListener("click", close);
    }
  },

  /**
   * Setup generation filter listeners for team builder
   */
  setupGenerationFilterListeners() {
    const genFilters = document.querySelectorAll(".team-builder-gen-filter");
    genFilters.forEach((checkbox) => {
      checkbox.addEventListener("change", () => {
        this.updateRecommendations();
      });
    });
  },

  /**
   * Setup the show calculations button
   */
  setupCalculationsButton() {
    const showCalcBtn = document.getElementById("show-full-team-calc");
    const calcBreakdown = document.getElementById("full-team-calc-breakdown");

    if (showCalcBtn && calcBreakdown) {
      // Remove any existing listeners by cloning
      const newBtn = showCalcBtn.cloneNode(true);
      showCalcBtn.parentNode.replaceChild(newBtn, showCalcBtn);

      newBtn.addEventListener("click", () => {
        if (calcBreakdown.style.display === "none") {
          const filledSlots = this.selectedPokemonData.filter(
            (p) => p !== null,
          );
          if (filledSlots.length >= 2) {
            const teamEff = filledSlots.map((p) => p.effectiveness);
            calcBreakdown.innerHTML = generateTeamScoreBreakdown(teamEff);
            calcBreakdown.style.display = "block";
            newBtn.textContent = "Hide Calculations";
          }
        } else {
          calcBreakdown.style.display = "none";
          newBtn.textContent = "Show Calculations";
        }
      });
    }
  },
};

// Initialize team builder event listeners when page loads
document.addEventListener("DOMContentLoaded", () => {
  teamBuilder.setupEventListeners();

  // Mobile: Collapsible search panels
  const toggleSearch1 = document.getElementById("toggle-search-1");
  const toggleSearch2 = document.getElementById("toggle-search-2");
  const searchPanel1 = document.getElementById("search-panel-1");
  const searchPanel2 = document.getElementById("search-panel-2");
  const icon1 = document.getElementById("search-1-icon");
  const icon2 = document.getElementById("search-2-icon");

  if (toggleSearch1) {
    toggleSearch1.addEventListener("click", () => {
      searchPanel1.classList.toggle("hidden");
      icon1.textContent = searchPanel1.classList.contains("hidden") ? "▶" : "▼";
    });
  }

  if (toggleSearch2) {
    toggleSearch2.addEventListener("click", () => {
      searchPanel2.classList.toggle("hidden");
      icon2.textContent = searchPanel2.classList.contains("hidden") ? "▶" : "▼";
    });
  }

  // Start with search panel 2 collapsed on mobile
  if (window.innerWidth < 1024 && searchPanel2) {
    searchPanel2.classList.add("hidden");
    if (icon2) icon2.textContent = "▶";
  }
});
