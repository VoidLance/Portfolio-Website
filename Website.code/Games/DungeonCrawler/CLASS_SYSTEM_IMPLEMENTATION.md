# Class System Implementation Guide

## ✅ Completed Tasks

### 1. Character Base Class (Character.js)
- Created base `Character` class with all stats and methods
- Includes: combat methods, stat getters, defense calculations
- Can be extended by specific character classes

### 2. Character Class Definitions (CharacterClasses.js)
- **Warrior**: High HP/STR/DEF, heavy armor, physical combat
  - Starting: Iron Sword, Chainmail, Shield/Fortify spells
  - Growth: +12 HP, +0.4 STR per level
  - Equipment: 50% weapons, 35% armor
  
- **Mage**: High MANA/POW, light armor, spell damage
  - Starting: Apprentice Wand, Arcane Pendant, 3 spells
  - Growth: +6 HP, +8 MANA, +0.5 POW per level
  - Equipment: 45% accessories, 40% weapons
  
- **Rogue**: High AGI, critical strikes, dodge
  - Starting: Dagger, Leather Vest, Silver Ring
  - Growth: +8 HP, +0.5 AGI per level
  - Equipment: 40% accessories, 35% weapons
  
- **Paladin**: Balanced, healing, holy magic
  - Starting: Iron Sword, Steel Plate Armor, Guardian Amulet
  - Growth: +10 HP, +6 MANA, balanced stats
  - Equipment: 40% armor, 35% weapons

### 3. HTML Integration
- Added script tags for Character.js and CharacterClasses.js
- Added class selection screen HTML (hidden by default)

## 🚧 Remaining Tasks

### 4. Integrate Classes into GameState

Need to modify `script.js`:

```javascript
// Add after line 4 (after discoveries: 0):
selectedClass: null, // Selected character class

// Replace entire character object (lines 43-200+) with:
character: null, // Will be initialized when class is selected
```

### 5. Create Class Selection Functions

Add to script.js before `GameController`:

```javascript
// Class Selection System
const ClassSelection = {
    showClassSelection: function() {
        const screen = document.getElementById('class-selection-screen');
        const container = document.getElementById('class-cards-container');
        container.innerHTML = '';
        
        for (const className in CLASS_DESCRIPTIONS) {
            const classInfo = CLASS_DESCRIPTIONS[className];
            const card = this.createClassCard(className, classInfo);
            container.appendChild(card);
        }
        
        screen.classList.remove('hidden');
        document.getElementById('game-story').parentElement.classList.add('hidden');
    },
    
    createClassCard: function(className, classInfo) {
        const card = document.createElement('div');
        card.className = 'bg-black/50 border-2 rounded-lg p-4 hover:border-cyan-400 transition-all cursor-pointer';
        card.style.borderColor = classInfo.color;
        
        card.innerHTML = `
            <div class="flex items-center mb-3">
                <i class="fas ${classInfo.icon} text-3xl mr-3" style="color: ${classInfo.color}"></i>
                <h3 class="text-2xl font-bold" style="color: ${classInfo.color}">${classInfo.name}</h3>
            </div>
            <p class="text-gray-300 mb-3">${classInfo.description}</p>
            <p class="text-sm text-gray-400 mb-2">${classInfo.startingStats}</p>
            <div class="mb-2">
                <p class="text-green-400 font-bold mb-1">Strengths:</p>
                <ul class="text-sm text-gray-300">
                    ${classInfo.strengths.map(s => `<li>• ${s}</li>`).join('')}
                </ul>
            </div>
            <div class="mb-3">
                <p class="text-red-400 font-bold mb-1">Weaknesses:</p>
                <ul class="text-sm text-gray-300">
                    ${classInfo.weaknesses.map(w => `<li>• ${w}</li>`).join('')}
                </ul>
            </div>
            <p class="text-xs text-cyan-300 italic">${classInfo.playstyle}</p>
        `;
        
        card.onclick = () => this.selectClass(className);
        return card;
    },
    
    selectClass: function(className) {
        gameState.selectedClass = className;
        const ClassConstructor = CHARACTER_CLASSES[className];
        gameState.character = new ClassConstructor();
        
        document.getElementById('class-selection-screen').classList.add('hidden');
        document.getElementById('game-story').parentElement.classList.remove('hidden');
        
        UI.addToLog(`<span style="color: ${CLASS_DESCRIPTIONS[className].color}">You have chosen the ${className} class!</span>`, "levelup");
        UI.updateDisplay();
        GameController.continueGameStart();
    }
};
```

### 6. Modify GameController.startNewGame()

Find `startNewGame:` function (around line 3199) and modify:

```javascript
startNewGame: function() {
    gameState.reset();
    
    // Show class selection instead of starting immediately
    ClassSelection.showClassSelection();
    UI.hideAllActionButtons();
},

// Add new function:
continueGameStart: function() {
    // This runs after class selection
    UI.updateStory("<i class='fas fa-door-open'></i> You enter the dungeon depths. The air grows cold as darkness surrounds you...");
    UI.addToLog("=== GAME START ===", "start");
    UI.addToLog(`Welcome, ${gameState.selectedClass}! Your adventure begins...`, "start");
    UI.showExplorationButtons();
    UI.updateDisplay();
}
```

### 7. Update gameState.reset()

Modify reset function (around line 215):

```javascript
reset() {
    this.level = 1;
    this.lives = 3;
    this.isGameOver = false;
    this.inCombat = false;
    this.currentEnemy = null;
    this.turnCounter = 0;
    this.dungeonDepth = 0;
    this.hasWon = false;
    this.finalBossDefeated = false;
    
    // Character will be initialized when class is selected
    this.character = null;
    this.selectedClass = null;
    
    // Reset shop costs
    // ... (keep existing shop reset code)
    
    // Reset encounter tracking
    // ... (keep existing encounter reset code)
    
    // Reset inventory
    this.inventory = {
        gold: 0,
        potions: 0,
        gems: 0,
        enemyKills: 0
    };
}
```

### 8. Update offerSpellChoice() for Class-Exclusive Spells

Modify `offerSpellChoice` (around line 343):

```javascript
offerSpellChoice(level) {
    if (!this.character || this.character.isVampire) return; // Skip if no character or vampire
    
    const spellList = GameData.spells;
    const classSpells = this.character.classSpells || []; // Get class-exclusive spells
    
    const availableSpells = [];
    for (const spellName in spellList) {
        const spell = spellList[spellName];
        
        // Check if spell is for this class AND matches level
        if (classSpells.includes(spellName) && 
            (spell.unlockLevel === level || (spell.unlockLevel >= level - 1 && spell.unlockLevel < level)) 
            && !this.character.knownSpells.includes(spellName)) {
            availableSpells.push(spellName);
        }
    }
    
    if (availableSpells.length === 0) return;
    
    const numChoices = Math.min(availableSpells.length, Math.random() < 0.4 ? 3 : 2);
    const spellChoices = [];
    for (let i = 0; i < numChoices; i++) {
        const randomIndex = Math.floor(Math.random() * availableSpells.length);
        spellChoices.push(availableSpells[randomIndex]);
        availableSpells.splice(randomIndex, 1);
    }
    
    UI.showSpellChoiceUI(spellChoices);
}
```

### 9. Update Character Leveling for Class Growth Rates

Find the `levelUp` call in `addGold` (around line 336) and create a new levelUp method:

```javascript
// Add to Character class or keep in gameState
levelUpCharacter() {
    if (!this.character || !this.character.growthRates) return;
    
    const rates = this.character.growthRates;
    
    // Apply growth rates
    this.character.maxHp += rates.hpPerLevel;
    this.character.hp = this.character.maxHp;
    this.character.maxMana += rates.manaPerLevel;
    this.character.mana = this.character.maxMana;
    
    // Apply stat increases with caps
    this.character.strength = Math.min(
        this.character.strength + rates.strengthPerLevel,
        this.character.maxStrength
    );
    this.character.agility = Math.min(
        this.character.agility + rates.agilityPerLevel,
        this.character.maxAgility
    );
    this.character.power = Math.min(
        this.character.power + rates.powerPerLevel,
        this.character.maxPower
    );
    this.character.defense = Math.min(
        this.character.defense + rates.defensePerLevel,
        this.character.maxDefense
    );
}
```

Then modify `addGold`:

```javascript
if (currentLevel > this.level) {
    this.level = currentLevel;
    this.levelUpCharacter(); // Use new method
    UI.addToLog(`⭐ LEVEL UP! Level ${this.level}!`, "levelup");
    this.offerSpellChoice(this.level);
}
```

### 10. Update Equipment.rollForDrop() for Class Preferences

Modify `Equipment.rollForDrop()` (around line 1792):

```javascript
rollForDrop: function(enemy = null) {
    const dropChance = 0.30;
    if (Math.random() > dropChance) return;
    
    let equipmentType, equipmentArray;
    
    // Use class preferences if available
    if (gameState.character && gameState.character.equipmentPreferences) {
        const prefs = gameState.character.equipmentPreferences;
        const roll = Math.random();
        
        if (roll < prefs.weapon) {
            equipmentType = 'weapon';
        } else if (roll < prefs.weapon + prefs.armor) {
            equipmentType = 'armor';
        } else {
            equipmentType = 'accessory';
        }
    } else {
        // Default behavior for backwards compatibility
        if (enemy && enemy.dropPreference) {
            equipmentType = enemy.dropPreference;
        } else {
            const roll = Math.random();
            if (roll < 0.4) equipmentType = 'weapon';
            else if (roll < 0.7) equipmentType = 'armor';
            else equipmentType = 'accessory';
        }
    }
    
    // ... rest of function remains the same
}
```

## 🎮 Testing Checklist

After implementation, test:

- [ ] Class selection screen shows on new game
- [ ] Each class has correct starting stats
- [ ] Each class has correct starting equipment
- [ ] Each class has correct starting spells
- [ ] Class-exclusive spells only offered to appropriate class
- [ ] Equipment drops match class preferences
- [ ] Leveling uses class-specific growth rates
- [ ] All four classes are playable and balanced
- [ ] Vampire transformation still works
- [ ] Game win/lose conditions work for all classes

## 📝 Notes

- Character class methods are inherited from base Character class
- All existing game functionality should remain compatible
- Class system is opt-in (legacy code path exists if no class selected)
- Growth rates are balanced for different playstyles
