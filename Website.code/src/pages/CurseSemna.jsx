// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { InformationCircleIcon, PlayCircleIcon, RectangleStackIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import PageWrapper from '../components/PageWrapper'

export default function CurseSemna() {
  const [activeTab, setActiveTab] = useState('lore')
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = {
    lore: {
      title: 'Lore',
      icon: InformationCircleIcon,
      index: [
        { id: 'cosmic-law', label: 'The Shattered Era' },
        { id: 'factions-shattered', label: 'The Shattered Era Factions' },
        { id: 'factions-second', label: 'Second Era Factions' },
      ],
      content: (
        <>
          <h3 id="cosmic-law" className="text-xl font-bold text-indie-accent-pink mb-3">The Cosmic Law & The Shattered Era</h3>
          <p className="mb-4">
            In the vast cosmos, every world is intrinsically tied to its creator deity and bears their exact name. Terria (the realm we know as Earth) was built on strict physical laws, devoid of magic, forcing its inhabitants to progress slowly. The world of Semna, however, was governed by a goddess of boundless generosity who flooded her realm with the untamed spark of Magic. Civilization flourished at a breathtaking, explosive pace.
          </p>
          <p className="mb-4">
            Consumed by jealousy, Goddess Terria cast a grand curse over her sister's world. At the exact moment Semna was about to reach its ultimate apex, the timeline violently snapped backward. Semna was condemned to an eternal 500-year loop—a phenomenon whispered of by fearful scholars as <span className="text-indie-accent-green font-bold">The Shattered Era</span>.
          </p>
          <h4 className="text-lg font-bold text-indie-accent-pink mb-3 mt-6">The Strategists & The Fractured Cycles</h4>
          <p className="mb-4">
            To fight the curse, Goddess Semna reached across the dimensional veil to Terria, summoning the immortal souls of brilliant tacticians—the Players. As a Strategist, you possess the bodies of Semna's greatest leaders, merging with them to provide the foresight needed to alter history. By stacking past leaders beneath your current one, you build a <span className="font-bold">History</span>, learning from past lives.
          </p>
          <p className="mb-4">
            However, Terria's curse is resilient; it cannot be shattered all at once. When a Strategist successfully alters history, the loop does not break entirely—it fractures. This fracture allows the timeline to push forward, granting the world another 500 years of existence before the curse violently snaps the timeline back to the initial fracture point.
          </p>
          <p className="mb-4">
            To push the timeline forward, you must wage war. Your <span className="font-bold">Deck</span> represents your faction's morale, manpower, and resources—the soldiers willing to fight for you, and the craftspeople forging weapons for your cause. As you take damage in war, casualties mount. The blood of your fallen and the remnants of your shattered resources physically bleed into the earth, soaking into Semna's dormant leylines and awakening raw magical <span className="font-bold">Energy</span>. You must balance hoarding this power to fracture the curse against spending it to survive. Draw in too much, however, and the leylines will violently rupture.
          </p>

          <h3 id="factions-shattered" className="text-xl font-bold text-indie-accent-pink mb-3 mt-8">Factions of The Shattered Era</h3>
          <p className="text-sm text-indie-text-gray/70 italic mb-4">The original 500-year loop</p>
          <div className="space-y-4">
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <h4 className="text-lg font-bold text-indie-accent-green mb-2">Gandor</h4>
              <p className="mb-2 text-sm">The oldest faction, predating the Shattered Era. Ruled by tradition and ancient Artefacts.</p>
              <p className="text-sm"><span className="text-indie-accent-pink font-bold">Leader:</span> The King of Gandor — a noble, frontline ruler on a pegasus who secretly utilizes a deadly four-man black-ops unit known as his "Limbs" to dismantle enemies.</p>
            </div>
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <h4 className="text-lg font-bold text-indie-accent-green mb-2">The Magisters & The Alchemy School</h4>
              <p className="text-sm">Led by the same man — the <span className="font-bold">Grand Magister</span>, a terrifyingly brilliant young prodigy. He oversees the Magisters (an elite school of haughty, true-blooded mages) and created the Alchemy School (a mercenary force of peasants taught to synthesize magic) to protect those who just want peace from the warmongering politicians.</p>
            </div>
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <h4 className="text-lg font-bold text-indie-accent-green mb-2">The Royals</h4>
              <p className="mb-2 text-sm">A young faction that rapidly developed unprecedented technology. They ride into battle alongside tamed blue and white wolves.</p>
              <p className="text-sm"><span className="text-indie-accent-pink font-bold">Leader:</span> Prince Karron — an arrogant, inexperienced teenager whose thirst for technological power ensures that, infuriatingly, whatever he tries succeeds.</p>
            </div>
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <h4 className="text-lg font-bold text-indie-accent-green mb-2">The Elves</h4>
              <p className="mb-2 text-sm">Emerging late in the loop, they bathed in magical wellsprings until cursed mushrooms corrupted their lands.</p>
              <ul className="space-y-2 mt-2">
                <li className="text-sm"><span className="text-indie-accent-pink font-bold">Pure Elves:</span> Led by Selennia, a fey princess desperate to heal her people.</li>
                <li className="text-sm"><span className="text-indie-accent-pink font-bold">Dark Elves & The Broken:</span> Led by Sasha, a pain-reveling dark mage who was eventually consumed by the blight, emerging as a boiled, undead physical powerhouse who retained her tactical genius and intends to corrupt all of Semna.</li>
              </ul>
            </div>
          </div>

          <h3 id="factions-second" className="text-xl font-bold text-indie-accent-pink mb-3 mt-8">Factions of the Second Era</h3>
          <p className="text-sm text-indie-text-gray/70 italic mb-4">The extended loops</p>
          <div className="space-y-4">
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <h4 className="text-lg font-bold text-indie-accent-green mb-2">The Abyss</h4>
              <p className="mb-2 text-sm">Rising from the oceans 100 years into the first extended timeline (Year 600), this pre-prepared military juggernaut threatens to drown the surface.</p>
              <p className="text-sm"><span className="text-indie-accent-pink font-bold">Leader:</span> Captain Eldron — a fearsome human marine who subjugated the abyssal monsters and can chip a dragon's heartscale from thirty feet without drawing her sword.</p>
            </div>
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <h4 className="text-lg font-bold text-indie-accent-green mb-2">The Time Garden</h4>
              <p className="mb-2 text-sm">A floating island of rigid, duty-bound chronomancers who police the expanding timelines, trying to maintain order amidst the chaotic resets.</p>
              <p className="text-sm"><span className="text-indie-accent-pink font-bold">Leader:</span> Sergeant Juki — an utterly ordinary, emotionless soldier who terrifyingly appears as an immutable constant in every major historical event and prophecy across all loops.</p>
            </div>
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <h4 className="text-lg font-bold text-indie-accent-green mb-2">The Troupe (Circus of the Veil)</h4>
              <p className="mb-2 text-sm">A chaotic rebellion of misfits disfigured by the violent temporal resets. They use fractured chronomancy to put on intricately complex, mind-boggling performances that mock the Time Garden's order.</p>
              <p className="text-sm"><span className="text-indie-accent-pink font-bold">Leader:</span> Aleister, Time-Scarred Freak — a former Magister who survived 200 years trapped in the veil of a reset. Despite his gaping, time-eaten flesh, he is a soft-spoken, darkly humorous genius orchestrating a bloodless rebellion.</p>
            </div>
          </div>
        </>
      )
    },
    rules: {
      title: 'Rules',
      icon: PlayCircleIcon,
      index: [
        { id: 'win-conditions', label: 'Win & Loss Conditions' },
        { id: 'setup', label: 'Setup & Deckbuilding' },
        { id: 'turns', label: 'Gameplay & Turns' },
      ],
      content: (
        <>
          <h3 id="win-conditions" className="text-xl font-bold text-indie-accent-pink mb-3">Win & Loss Conditions</h3>
          <h4 className="text-lg font-bold text-indie-accent-pink mb-2 mt-4">The Primary Objective: Historical Relapse</h4>
          <p className="mb-4">Every faction, regardless of playstyle, shares one universal goal: break the opponent's resolve.</p>
          <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20 mb-4">
            <span className="text-indie-accent-green font-bold">Historical Relapse (Deck Depletion):</span>
            <p className="mt-1 text-sm">Your deck is your faction's morale and resources. Depleting the opponent's deck through combat damage is the primary way to win. If a player's Main Deck runs out of cards and they are required to draw or take damage, their faction has lost faith—resulting in a loss.</p>
          </div>

          <h4 className="text-lg font-bold text-indie-accent-pink mb-2 mt-6">Special Conditions</h4>
          <div className="space-y-3 mb-6">
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">Effect Victory:</span>
              <p className="mt-1 text-sm">Specific card effects (e.g., assembling the King of Gandor's "Limbs", or a Time Garden master chronomancer whose effect wins if all enemy units are trapped in Stasis).</p>
            </div>
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">Energy Victory:</span>
              <p className="mt-1 text-sm">Accumulating exactly <span className="font-bold">30–34 Energy</span> channels the land's magical critical mass to fracture the curse—immediate win.</p>
            </div>
            <div className="glass-darker p-4 rounded-lg border border-red-400/40">
              <span className="text-red-400 font-bold">Overload Loss:</span>
              <p className="mt-1 text-sm">Accumulating <span className="font-bold">35+ Energy</span> causes a catastrophic magical rupture—immediate loss.</p>
            </div>
          </div>

          <h4 className="text-lg font-bold text-indie-accent-pink mb-2 mt-6">Simultaneous Resolution Priority</h4>
          <p className="mb-3 text-sm">If a single action triggers multiple win/loss conditions simultaneously, they resolve in this strict order:</p>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><span className="font-bold">Effect Victory</span> <span className="text-indie-text-gray/70">(non-turn player wins if both players achieve this simultaneously)</span></li>
            <li><span className="font-bold">Overload Loss</span></li>
            <li><span className="font-bold">Energy Victory</span></li>
            <li><span className="font-bold">Historical Relapse</span> (Deck Depletion)</li>
          </ol>

          <h3 id="setup" className="text-xl font-bold text-indie-accent-pink mb-3 mt-8">Setup & Deckbuilding</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <h4 className="font-bold text-indie-accent-green mb-2">Main Deck</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Exactly <span className="font-bold">50 cards</span></li>
                <li>Max <span className="font-bold">4 copies</span> of any card</li>
                <li>All cards must match your Leader's Faction or have no faction icon</li>
                <li>Cards without a faction icon are <span className="font-bold">neutral</span> and can be played in any deck</li>
              </ul>
            </div>
            <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/20">
              <h4 className="font-bold text-indie-accent-green mb-2">Artefact Deck</h4>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Up to <span className="font-bold">5 cards</span></li>
                <li><span className="font-bold">No duplicates</span></li>
              </ul>
            </div>
          </div>
          <h4 className="text-lg font-bold text-indie-accent-pink mb-2">Starting a Game</h4>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Select a <span className="font-bold">Level 0</span> unit as your Leader.</li>
            <li>Draw <span className="font-bold">5 cards</span>.</li>
            <li>Flip a coin for turn order.</li>
          </ol>
          <h4 className="text-lg font-bold text-indie-accent-pink mb-2 mt-4">Mulligan</h4>
          <p>Replace any number of cards. Subsequent mulligans draw one fewer card than replaced.</p>

          <h3 id="turns" className="text-xl font-bold text-indie-accent-pink mb-3 mt-8">Gameplay & Turns</h3>
          <p className="mb-4">Each turn consists of the following stages in order:</p>
          <div className="space-y-3">
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">1. Refresh Stage:</span>
              <span className="ml-2 text-sm">Refresh rested units, draw a card.</span>
            </div>
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">2. Boost Stage:</span>
              <span className="ml-2 text-sm">Clear old Boost, play one new Boost card (active until next Boost Stage).</span>
            </div>
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">3. Level Stage:</span>
              <span className="ml-2 text-sm">Play a unit exactly one level higher than your Leader. The old Leader moves to History (stacked beneath the new Leader).</span>
            </div>
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">4. Main Stage:</span>
              <span className="ml-2 text-sm">Play units/spells matching your Leader's faction (or factionless cards) at or below your Leader's level. Pay costs by sending Energy to the Lost Zone.</span>
            </div>
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">5. War Stage:</span>
              <span className="ml-2 text-sm">Attack with front-row units (rest them). Support units can be rested to assist the Leader or the Wing unit in front of them.</span>
            </div>
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">6. End Stage:</span>
              <span className="ml-2 text-sm">Pass turn. Discard random cards down to a 9-card hand limit.</span>
            </div>
          </div>
        </>
      )
    },
    cards: {
      title: 'Cards',
      icon: RectangleStackIcon,
      index: [
        { id: 'zones', label: 'Zones' },
        { id: 'card-types', label: 'Card Types' },
        { id: 'combat', label: 'Combat & Energy' },
      ],
      content: (
        <>
          <h3 id="zones" className="text-xl font-bold text-indie-accent-pink mb-3">Zones</h3>
          <h4 className="text-lg font-bold text-indie-accent-pink mb-2">Board Layout</h4>
          <div className="mb-6">
            <p className="text-sm font-bold text-indie-text-gray/70 mb-2">Front Row:</p>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="px-3 py-1 rounded bg-indie-accent-green/10 border border-indie-accent-green/30 text-sm font-bold">Wing 1</span>
              <span className="px-3 py-1 rounded bg-indie-accent-pink/10 border border-indie-accent-pink/30 text-sm font-bold">Leader</span>
              <span className="px-3 py-1 rounded bg-indie-accent-green/10 border border-indie-accent-green/30 text-sm font-bold">Wing 2</span>
            </div>
            <p className="text-sm font-bold text-indie-text-gray/70 mb-2">Back Row:</p>
            <div className="flex gap-2 flex-wrap mb-3">
              <span className="px-3 py-1 rounded bg-indie-accent-green/10 border border-indie-accent-green/30 text-sm font-bold">Support 1</span>
              <span className="px-3 py-1 rounded bg-indie-accent-green/10 border border-indie-accent-green/30 text-sm font-bold">Support 2</span>
            </div>
            <p className="text-xs text-indie-text-gray/60 italic">Support 1 sits behind Wing 1 and the Leader; Support 2 sits behind Wing 2 and the Leader.</p>
          </div>
          <ul className="space-y-2 mb-6">
            <li><span className="text-indie-accent-green font-bold">Deck:</span> Your main deck, placed face-down.</li>
            <li><span className="text-indie-accent-green font-bold">Lost Zone:</span> Cards that are discarded or destroyed.</li>
            <li><span className="text-indie-accent-green font-bold">Erased Zone:</span> Cards removed from the game entirely.</li>
            <li><span className="text-indie-accent-green font-bold">Artefact Zone:</span> Your Artefact deck, face-down.</li>
            <li><span className="text-indie-accent-green font-bold">Energy Zone:</span> Cards placed here when you take damage, face-down.</li>
            <li><span className="text-indie-accent-green font-bold">Boost Zone:</span> One active Boost card. Cleared at the start of each Boost Stage.</li>
          </ul>

          <h3 id="card-types" className="text-xl font-bold text-indie-accent-pink mb-3 mt-8">Card Types</h3>
          <div className="space-y-3 mb-6">
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">Unit:</span>
              <span className="ml-2 text-sm">Core combatants with Power and Shield values.</span>
            </div>
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">Spell:</span>
              <span className="ml-2 text-sm">Single-use effects. Sent to the Lost Zone after use.</span>
            </div>
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">Equipment:</span>
              <span className="ml-2 text-sm">Attached to units to permanently increase their Damage/Shield.</span>
            </div>
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">Strategy:</span>
              <span className="ml-2 text-sm">Faction-specific cards with Trigger conditions.</span>
            </div>
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">Boost:</span>
              <span className="ml-2 text-sm">Played in the Boost Zone for board-wide effects, or from hand during War Stage for defense.</span>
            </div>
            <div className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
              <span className="text-indie-accent-green font-bold">Artefact:</span>
              <span className="ml-2 text-sm">Excavated from the Artefact Deck to provide persistent field effects.</span>
            </div>
          </div>

          <h3 id="combat" className="text-xl font-bold text-indie-accent-pink mb-3 mt-8">Combat & Energy</h3>
          <h4 className="text-lg font-bold text-indie-accent-pink mb-2">Combat</h4>
          <p className="mb-3">Attacker rests a front-row unit to strike. Defender may use Boosts, Spells, or discard units from hand (at/below Leader level) for Shield. Guardian units can be rested to redirect attacks to themselves.</p>
          <h4 className="text-lg font-bold text-indie-accent-pink mb-2 mt-4">Damage — Bleeding into the Leylines</h4>
          <p className="mb-3">Taking <span className="font-bold">1 damage</span> moves the top card of your deck directly to your <span className="font-bold">Energy Zone</span>. This represents your faction's casualties and broken resources physically bleeding into the ground, stirring Semna's leylines into raw magical Energy. While this fuels your spells, it drains your faction's resolve, accelerating your path to Historical Relapse.</p>
          <h4 className="text-lg font-bold text-indie-accent-pink mb-2 mt-4">Attacker's Reward</h4>
          <p>Once per turn, dealing damage to the opponent's Leader lets you <span className="font-bold">Energise 1</span>—place the top card of your deck into your Energy Zone, fueling your own magic at the cost of your faction's stamina.</p>
        </>
      )
    },
    reference: {
      title: 'Reference',
      icon: BookOpenIcon,
      index: [
        { id: 'glossary', label: 'Glossary' },
        { id: 'keywords', label: 'Keywords' },
      ],
      content: (
        <>
          <h3 id="glossary" className="text-xl font-bold text-indie-accent-pink mb-3">Glossary</h3>
          <div className="space-y-3 mb-6">
            {[
              { term: 'Erase', def: 'Remove a card from the game entirely.' },
              { term: 'Excavate', def: 'Reveal the top card of the Artefact Deck and place it on the field.' },
              { term: 'History', def: 'Cards stacked under your Leader representing past lives and previous loops.' },
              { term: 'Token', def: 'Units created by card effects. If they leave the field, they are Erased.' },
              { term: 'Refreshed', def: 'Vertical; ready to act.' },
              { term: 'Rested', def: 'Horizontal; cannot attack or use certain abilities.' },
              { term: 'Stasis', def: 'Face-down; loses all stats, names, and effects until flipped.' },
              { term: 'Stunned', def: 'Upside down; cannot attack, defend, or use abilities.' },
            ].map(({ term, def }) => (
              <div key={term}>
                <span className="text-indie-accent-green font-bold">{term}:</span>
                <span className="ml-2 text-sm">{def}</span>
              </div>
            ))}
          </div>

          <h3 id="keywords" className="text-xl font-bold text-indie-accent-pink mb-3 mt-8">Keywords</h3>
          <div className="space-y-3">
            {[
              { term: 'Ambush', def: 'This unit can be played face-down in Stasis and flipped face-up during the War Stage to trigger surprise effects.' },
              { term: 'Armour [X]', def: 'Reduces incoming damage taken by this unit or Leader by [X].' },
              { term: 'Breach', def: "If this attacking unit's Power exceeds the defending unit's Shield, the excess is dealt as damage to the opponent's Leader." },
              { term: 'Cleave', def: 'When this unit attacks, it also deals its damage to one adjacent enemy unit.' },
              { term: 'Decaying', def: 'This unit is unstable and is sent to the Lost Zone at the end of the turn.' },
              { term: 'Energise [X]', def: 'Place the top [X] cards of your Main Deck directly into your Energy Zone.' },
              { term: 'Guardian', def: "When an opponent attacks your Leader or another unit, you may rest this unit to redirect the attack to itself, taking the blow in their stead." },
              { term: 'Heal [X]', def: 'Move [X] cards from your Energy Zone to the bottom of your Main Deck (restoring morale/resources and avoiding Overload).' },
              { term: 'Level Down', def: 'Revert your Leader to its previous level by removing the top card of your Leader stack.' },
              { term: 'Manifest', def: 'Put a card directly onto the field from outside your hand (e.g., creating a Token or summoning directly from the deck).' },
              { term: 'Sacrifice', def: 'Send a unit you control to the Lost Zone as a cost to activate an ability.' },
              { term: 'Shift', def: 'Move a unit to an adjacent empty zone on your board (e.g., from the Support Zone to the Wing Zone).' },
            ].map(({ term, def }) => (
              <div key={term} className="glass-darker p-3 rounded-lg border border-indie-accent-green/20">
                <span className="text-indie-accent-green font-bold">{term}:</span>
                <span className="ml-2 text-sm">{def}</span>
              </div>
            ))}
          </div>
        </>
      )
    }
  }

  // Map section IDs to their tabs for anchor-based deep-linking
  const sectionToTab = {}
  Object.entries(tabs).forEach(([tabKey, tabData]) => {
    if (tabData.index) {
      tabData.index.forEach(({ id }) => {
        sectionToTab[id] = tabKey
      })
    }
  })

  // Sync tab from URL query (e.g., ?tab=gameplay)
  useEffect(() => {
    // Fallback for HashRouter quirks: parse search from window.location.hash
    const rawHash = typeof window !== 'undefined' ? window.location.hash : ''
    const hashSearch = rawHash.includes('?') ? rawHash.substring(rawHash.indexOf('?')) : ''
    const effectiveSearch = location.search && location.search.length > 0 ? location.search : hashSearch
    const params = new URLSearchParams(effectiveSearch)
    const urlTab = params.get('tab')
    if (urlTab && tabs[urlTab] && urlTab !== activeTab) {
      setActiveTab(urlTab)
    }
  }, [location.search])

  // Smooth scroll to section from URL (e.g., &section=combat)
  useEffect(() => {
    const rawHash = typeof window !== 'undefined' ? window.location.hash : ''
    const hashSearch = rawHash.includes('?') ? rawHash.substring(rawHash.indexOf('?')) : ''
    const effectiveSearch = location.search && location.search.length > 0 ? location.search : hashSearch
    const params = new URLSearchParams(effectiveSearch)
    const section = params.get('section')
    if (section) {
      const el = document.getElementById(section)
      if (el) {
        // small timeout ensures content is in DOM after tab switch
        setTimeout(() => {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 50)
      }
    }
  }, [activeTab, location.search])

  // Handle anchor-based deep-linking (e.g., #combat switches to gameplay tab)
  useEffect(() => {
    const rawHash = typeof window !== 'undefined' ? window.location.hash : ''
    // Extract the last anchor after the pathname (e.g., from "#/games/curse-semna#combat" get "combat")
    const parts = rawHash.split('#').filter(p => p && !p.startsWith('/'))
    const anchor = parts[parts.length - 1]

    if (anchor && sectionToTab[anchor]) {
      const tabForSection = sectionToTab[anchor]
      if (tabForSection !== activeTab) {
        setActiveTab(tabForSection)
      }
      // Scroll after a short delay to ensure DOM is updated
      setTimeout(() => {
        const el = document.getElementById(anchor)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 50)
    }
  }, [])

  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-4xl text-indie-accent-green text-center mb-4 font-heading">Semna: Shattered Cycles</h1>
      <p className="text-center text-indie-text-gray/70 text-sm mb-4 italic">Official Rulebook & Lore Compendium</p>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />

      {/* Tabbed Navigation */}
      <div className="flex flex-wrap gap-3 mb-6 border-b-2 border-indie-accent-green/30 pb-4">
        {Object.keys(tabs).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => {
              setActiveTab(tabKey)
              const params = new URLSearchParams(location.search || '')
              params.set('tab', tabKey)
              navigate({ search: `?${params.toString()}` }, { replace: true })
            }}
            aria-current={activeTab === tabKey ? 'page' : undefined}
            className={`px-4 py-2 rounded-t-lg font-bold text-sm transition-all duration-200 cursor-pointer inline-flex items-center gap-2 border-b-4 ${activeTab === tabKey
                ? 'border-b-indie-accent-green text-indie-accent-green bg-indie-accent-green/10'
                : 'border-b-transparent text-indie-text-light hover:text-indie-accent-green hover:bg-indie-accent-green/5'
              }`}
          >
            {(() => {
              const Icon = tabs[tabKey].icon
              return <Icon className="w-5 h-5" aria-hidden="true" />
            })()}
            {tabs[tabKey].title}
          </button>
        ))}
      </div>

      {/* Quick Index */}
      {tabs[activeTab].index && (
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-sm text-indie-text-gray/80">Quick Index:</span>
          {tabs[activeTab].index.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                const params = new URLSearchParams(location.search || '')
                params.set('section', item.id)
                navigate({ search: `?${params.toString()}` }, { replace: true })
                const el = document.getElementById(item.id)
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              className="text-xs px-3 py-1 rounded-full border border-indie-accent-green/40 bg-indie-bg-main/40 hover:bg-indie-accent-green/20 hover:border-indie-accent-green transition"
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Tab Content */}
      <article className="text-indie-text-gray">
        <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">{tabs[activeTab].title}</h2>
        {tabs[activeTab].content}
      </article>

      {/* Work in Progress Status */}
      <div className="mt-8 text-center">
        <p className="text-sm text-indie-text-gray/70 italic">
          Status: Work in Progress
        </p>
      </div>
    </PageWrapper>
  )
}
