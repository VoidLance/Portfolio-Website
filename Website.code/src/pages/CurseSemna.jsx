// NOTE: AI readers - please check AI_AGENT_GUIDE.md in the project root for instructions
import React, { useState } from 'react'
import PageWrapper from '../components/PageWrapper'

export default function CurseSemna() {
  const [activeTab, setActiveTab] = useState('story')

  const tabs = {
    story: {
      title: 'Story',
      content: (
        <>
          <p className="mb-4">
            Semna is a world in a different dimension reminiscent of a fantasy story that has been cursed by a petty goddess. Semna had been flourishing and growing quickly thanks to the gifts given to them by their goddess such as magic. Semna's rival goddess, Terria, grew jealous of her success. Since Semna had grown so much quicker than Terria, she concocted a curse that would cause the world to forever recite its history and never progress further—cycling through the same 500 years forever.
          </p>
          <p className="mb-4">
            Semna, upset at what her sister had done to her creation but unwilling to stoop to the same level, devised a way to undo the curse. She would find willing strategists from other worlds and bring them to Semna in the form of immortal souls inhabiting the bodies of the world's greatest leaders in order to change the flow of history and open up a new future.
          </p>
          <div className="glass-darker p-4 rounded-lg border border-indie-accent-green/30 mt-4">
            <p className="text-indie-accent-green italic font-bold">The players of Curse of Semna TCG are the chosen strategists, interacting with Semna through their cards. The full 500 year history of Semna will be revealed through books, and as the TCG evolves and major battles are fought, new history will be written which will provide access to new cards and factions to control.</p>
          </div>
        </>
      )
    },
    objective: {
      title: 'Win Conditions',
      content: (
        <>
          <p className="mb-4">You win the game if:</p>
          <ul className="list-disc list-inside space-y-3">
            <li><span className="text-indie-accent-green font-bold">Your opponent runs out of cards in their deck</span>, or</li>
            <li><span className="text-indie-accent-green font-bold">You accumulate 35 Energy</span> (damage threshold)</li>
          </ul>
        </>
      )
    },
    setup: {
      title: 'Setup',
      content: (
        <>
          <h3 className="text-xl font-bold text-indie-accent-pink mb-3">Starting a Game:</h3>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Each player selects a Level 0 unit from their deck to play as their <span className="font-bold">Leader</span>.</li>
            <li>Each player shuffles their deck and draws 5 cards.</li>
            <li>Flip a coin to decide who takes the first turn.</li>
          </ol>
          <h3 className="text-xl font-bold text-indie-accent-pink mb-3">Mulligan:</h3>
          <p>Starting with the first player, each player can replace as many cards from their hand as they wish on the bottom of their deck and draw the same number. This can be done multiple times, but after the first mulligan, you draw 1 fewer card than the previous mulligan.</p>
        </>
      )
    },
    turnStructure: {
      title: 'Turns',
      content: (
        <>
          <p className="mb-4">Each turn consists of the following stages in order:</p>
          <ul className="space-y-3">
            <li><span className="text-indie-accent-green font-bold">Refresh Stage:</span> Turn player refreshes all rested units and draws a card.</li>
            <li><span className="text-indie-accent-green font-bold">Boost Stage:</span> Turn player may play a Boost card from their hand.</li>
            <li><span className="text-indie-accent-green font-bold">Level Stage:</span> Turn player may level up by selecting a unit one level higher than their Leader. The old Leader becomes part of History.</li>
            <li><span className="text-indie-accent-green font-bold">Main Stage:</span> Turn player may play any units at or below their Leader's level, or any spells or strategies.</li>
            <li><span className="text-indie-accent-green font-bold">War Stage:</span> Turn player declares attacks with Front units (Wing or Leader units) by resting them. Support units can assist attacks. Defending player can use Boost/Spell cards and Shield cards from hand.</li>
          </ul>
          <p className="mt-4 text-sm italic">The turn ends once the last refreshed unit has made an attack or when the turn player decides, whichever comes first.</p>
        </>
      )
    },
    combat: {
      title: 'Combat',
      content: (
        <>
          <p className="mb-4">During the War stage, players can make attacks using their Leader and Wing units.</p>
          <h3 className="text-lg font-bold text-indie-accent-pink mb-3">How Combat Works:</h3>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>The attacker declares an attack with a Front unit (Leader or Wing).</li>
            <li>Compare the <span className="font-bold">Power</span> of the attacking unit against the <span className="font-bold">Shield</span> of the defending unit.</li>
            <li>The unit with the higher number wins. In case of a tie, both are defeated.</li>
            <li>If a Wing unit loses, it is destroyed. If the Leader loses, damage is dealt to the owner equal to the opposing unit's damage rating.</li>
          </ol>
          <h3 className="text-lg font-bold text-indie-accent-pink mb-3">Support & Defense:</h3>
          <ul className="list-disc list-inside space-y-2">
            <li><span className="font-bold">Support Units</span> can assist an attack by resting and adding their power and damage to the attacking unit.</li>
            <li>The defending player can use Boost, Spell cards, or Shield cards from their hand to boost the defending unit's Shield.</li>
          </ul>
        </>
      )
    },
    energy: {
      title: 'Energy',
      content: (
        <>
          <p className="mb-4">Energy is a critical resource that represents damage taken throughout the game.</p>
          <ul className="list-disc list-inside space-y-3 mb-4">
            <li>When you take <span className="font-bold">1 damage</span>, place the <span className="font-bold">top card of your deck</span> into your <span className="font-bold">Energy zone</span>.</li>
            <li>Energy cards are placed face-down in the Energy zone. (Recommended: stack in groups of 6 for easy tracking of 30 energy)</li>
            <li>To pay the energy cost for a card, send that many cards from your Energy zone to your Lost zone.</li>
            <li>If you reach or exceed <span className="text-indie-accent-green font-bold">35 Energy</span>, you lose the game immediately.</li>
          </ul>
        </>
      )
    },
    cardTypes: {
      title: 'Cards',
      content: (
        <>
          <h3 className="text-lg font-bold text-indie-accent-pink mb-3">Card Types:</h3>
          <ul className="space-y-3 mb-6">
            <li><span className="text-indie-accent-green font-bold">Unit:</span> The core of any deck. Used to battle your opponent.</li>
            <li><span className="text-indie-accent-green font-bold">Spell:</span> Powerful equalizers that can only be used once per turn. They become Lost after use.</li>
            <li><span className="text-indie-accent-green font-bold">Boost:</span> Can be used during the Boost phase to power up battling cards. Only one Boost card may be active at a time.</li>
            <li><span className="text-indie-accent-green font-bold">Artefact:</span> Kept in a separate deck. Some cards may excavate an Artefact (pick up the top card and place it on the field).</li>
            <li><span className="text-indie-accent-green font-bold">Equipment:</span> Have an "attach this to a unit" effect. They add their damage and shield to the equipped unit.</li>
          </ul>
          <h3 className="text-lg font-bold text-indie-accent-pink mb-3">Unit Roles:</h3>
          <ul className="space-y-3">
            <li><span className="text-indie-accent-green font-bold">Leader:</span> Chosen at start. Cannot be lost normally. Can be upgraded by 1 level each turn.</li>
            <li><span className="text-indie-accent-green font-bold">Wing:</span> Placed on either side of the Leader. Can attack and be lost. Cannot be Supported. Cannot be higher level than the Leader.</li>
            <li><span className="text-indie-accent-green font-bold">Support:</span> Cannot attack, but can assist the Leader with their abilities. Can be lost to make room for new units.</li>
          </ul>
        </>
      )
    },
    deckbuilding: {
      title: 'Deckbuilding',
      content: (
        <>
          <h3 className="text-lg font-bold text-indie-accent-pink mb-3">Main Deck:</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Must contain exactly <span className="font-bold">40 cards</span></li>
            <li>May contain up to <span className="font-bold">4 copies</span> of any one card (same name, effect, power, and damage)</li>
          </ul>
          <h3 className="text-lg font-bold text-indie-accent-pink mb-3">Artefact Deck:</h3>
          <ul className="list-disc list-inside space-y-2 mb-4">
            <li>Can contain up to <span className="font-bold">5 cards</span></li>
            <li>May <span className="font-bold">not contain any duplicates</span></li>
          </ul>
          <h3 className="text-lg font-bold text-indie-accent-pink mb-3">Strategy:</h3>
          <p>Try to build your deck around a central goal. Build synergies between your cards and your chosen faction to maximize effectiveness.</p>
        </>
      )
    },
    zones: {
      title: 'Zones',
      content: (
        <>
          <ul className="space-y-3">
            <li><span className="text-indie-accent-green font-bold">Deck:</span> Your main deck placed face down.</li>
            <li><span className="text-indie-accent-green font-bold">Lost Zone:</span> Cards that are lost or discarded go here.</li>
            <li><span className="text-indie-accent-green font-bold">Artefact:</span> Your shuffled artefact deck placed face down.</li>
            <li><span className="text-indie-accent-green font-bold">Leader Zone:</span> Your Leader unit is placed here.</li>
            <li><span className="text-indie-accent-green font-bold">Wing Zones:</span> Wing units go here (left and right of Leader).</li>
            <li><span className="text-indie-accent-green font-bold">Support Zone:</span> Support units go here. You can lose a Support unit once per turn during Main stage to make room, but you take 1 damage each time.</li>
            <li><span className="text-indie-accent-green font-bold">Energy Zone:</span> Energy cards go here when you take damage.</li>
            <li><span className="text-indie-accent-green font-bold">Boost Zone:</span> Only one Boost card may be active. Playing a new Boost card loses the previous one.</li>
          </ul>
        </>
      )
    },
    glossary: {
      title: 'Glossary',
      content: (
        <>
          <div className="space-y-3">
            <div>
              <span className="text-indie-accent-green font-bold">Armour:</span> Reduces damage by up to that amount once per turn. Decaying Armour is reduced by the damage it prevents.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Energise:</span> Place a card face down in the Energy zone.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Excavate:</span> Turn a card from your Artefact deck face-up and place it on the table.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Guardian:</span> A unit with this effect can defend from a Wing zone as well as the hand.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Heal X:</span> Shuffle X cards from your Lost Zone back into your deck.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">History:</span> The memory of all Leaders that came before. Cards underneath your current Leader (except the Leader itself) are part of your History.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Levelled Up/Level Up:</span> When you place a new Leader of higher grade onto your current Leader. The old Leader moves to History and cannot be reacted to.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Level Down:</span> Send the current Leader to the Lost Zone.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Lose a Card:</span> Send it to the Lost pile.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Refresh:</span> Turn a Rested unit back to vertical position.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Remove:</span> Send that many cards from opponent's Energy zone to their Lost zone.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Rest:</span> Turn a unit horizontal (it cannot attack but can use abilities).
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Sacrifice:</span> Lose a unit to have this card gain the sacrificed unit's power until end of turn.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Stunned:</span> A card turned upside down that cannot attack or use abilities. Refreshes at the start of its controller's turn.
            </div>
            <div>
              <span className="text-indie-accent-green font-bold">Stasis:</span> A card flipped face-down that loses all details. Stays that way until the end of the controlling player's next turn.
            </div>
          </div>
        </>
      )
    },
    coreRules: {
      title: 'Rules',
      content: (
        <>
          <ul className="space-y-3">
            <li>Each player has a <span className="font-bold">Leader</span> that changes over the course of the game (History).</li>
            <li>The Leader has two <span className="font-bold">Wing units</span> that assist in combat and two <span className="font-bold">Support units</span> that assist with board presence.</li>
            <li>A Leader's progression is depicted in their <span className="font-bold">Level</span>, and they dictate what cards can be played—only cards from the Leader's factions at or below their level may be used.</li>
            <li>Units have <span className="font-bold">Power</span> and <span className="font-bold">Shield</span> values. In a fight, the attacker's Power is compared against the defender's Shield.</li>
            <li>Spells and units may be played to add to the defender's Shield, but they are Lost upon use.</li>
            <li><span className="font-bold">If a card text would usurp a rule that is normally in place, the card text takes precedence.</span></li>
            <li>If a player is asked to do something they can partially do, they do as much as possible.</li>
            <li>If a player is asked to do something they cannot, the action is not performed.</li>
          </ul>
        </>
      )
    }
  }

  return (
    <PageWrapper mainClassName="w-full">
      <h1 className="text-4xl text-indie-accent-green text-center mb-4 font-heading">Curse of Semna</h1>
      <hr className="border-0 border-t border-indie-accent-green/50 my-4" />
      
      {/* Tabbed Navigation */}
      <div className="flex flex-wrap gap-3 mb-8 border-b-2 border-indie-accent-green/30 pb-4">
        {Object.keys(tabs).map((tabKey) => (
          <button
            key={tabKey}
            onClick={() => setActiveTab(tabKey)}
            className={`px-4 py-2 rounded-lg font-bold text-sm transition-all duration-200 cursor-pointer ${
              activeTab === tabKey
                ? 'bg-indie-accent-green text-indie-bg-main shadow-indie scale-105 border-2 border-indie-accent-green'
                : 'bg-indie-bg-main/50 border-2 border-indie-accent-green/50 text-indie-text-light hover:border-indie-accent-green hover:bg-indie-accent-green/20 hover:scale-105'
            }`}
          >
            {tabs[tabKey].title.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <article className="text-indie-text-gray">
        <h2 className="text-2xl text-indie-accent-pink font-bold mb-3">{tabs[activeTab].title}</h2>
        {tabs[activeTab].content}
      </article>
    </PageWrapper>
  )
}
