# Black Market UI Implementation Design

## Overview

This document outlines the design for implementing a proper UI for the black market in the GTA-inspired game. Currently, the black market exists as a zone type but lacks a proper buying/selling interface. The implementation will include a shop interface for purchasing power-ups and special items using in-game currency.

## Architecture

### Current Implementation
The black market is implemented as a `Zone` type in `zones.js` with:
- Power-up types that can be acquired
- Basic interaction through the 'E' key
- Simple power-up distribution mechanism

### Missing Components
1. `givePlayerPowerUp` method in `PowerUpManager`
2. Dedicated shop UI for browsing and purchasing items
3. Proper money/transaction system integration
4. Visual feedback for transactions

## UI Design

### Black Market Shop Interface
The black market UI will be implemented as a modal overlay that appears when the player interacts with a black market zone.

#### UI Elements
1. **Shop Window**
   - Header with shop name and player money display
   - Scrollable list of available items
   - Item cards with:
     - Icon
     - Name
     - Description
     - Price
     - Purchase button
   - Close button

2. **Item Details**
   - Visual representation of the item
   - Detailed description
   - Price and availability status
   - Purchase confirmation

3. **Transaction Feedback**
   - Success messages
   - Insufficient funds warnings
   - Inventory full notifications

### UI Positioning
The black market shop interface will appear as a modal overlay centered on the screen, similar to the pause menu implementation.

### Visual Design
- Purple color scheme to match the black market zone color
- Dark theme with high contrast text for readability
- Icon-based item representation
- Animated transitions for opening/closing

## Data Models

### Power-Up Item Structure
```javascript
{
  id: string,           // Unique identifier
  name: string,         // Display name
  description: string,  // Item description
  price: number,        // Cost in game currency
  icon: string,         // Emoji or icon representation
  type: string,         // Power-up type identifier
  value: any,           // Power-up value/amount
  duration: number      // Duration for temporary power-ups (0 for permanent)
}
```

### Shop Inventory
The black market will have a predefined inventory based on the zone level:
- Level 1: Basic power-ups (health, speed, damage)
- Level 2: Intermediate power-ups (rapid fire, multi-shot)
- Level 3: Advanced power-ups (invincibility, explosive ammo)

## Implementation Plan

### 1. PowerUpManager Enhancement
Add the missing `givePlayerPowerUp` method to the PowerUpManager class:

```javascript
/**
 * Give player a specific power-up
 * @param {string} type - Power-up type
 */
givePlayerPowerUp(type) {
    // Find power-up configuration
    const powerUp = new PowerUp(this.game, 0, 0, type);
    
    // Apply power-up effect to player
    if (this.game.player) {
        this.game.player.addPowerUp(
            powerUp.config.effect,
            powerUp.config.value,
            powerUp.config.duration
        );
        
        // Create collection effect
        if (this.game.addTextEffect) {
            this.game.addTextEffect(
                this.game.player.x,
                this.game.player.y - 30,
                powerUp.config.name,
                powerUp.config.color,
                2000
            );
        }
    }
    
    // Play pickup sound
    if (this.game.audioManager) {
        this.game.audioManager.playSound('powerup_pickup');
    }
}
```

### 2. Black Market Shop UI
Implement a shop interface in the UI class:

```javascript
/**
 * Show black market shop interface
 * @param {Zone} zone - Black market zone
 */
showBlackMarketShop(zone) {
    // Create shop overlay
    const overlay = document.createElement('div');
    overlay.id = 'black-market-shop';
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
    `;
    
    // Create shop window
    const shopWindow = document.createElement('div');
    shopWindow.style.cssText = `
        background: #2a0a2a;
        border: 2px solid #800080;
        border-radius: 10px;
        width: 600px;
        max-width: 90%;
        max-height: 80%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    `;
    
    // Shop header
    const header = document.createElement('div');
    header.style.cssText = `
        background: #4b0082;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const title = document.createElement('h2');
    title.textContent = 'BLACK MARKET';
    title.style.cssText = `
        margin: 0;
        color: #fff;
        font-size: 24px;
    `;
    
    const moneyDisplay = document.createElement('div');
    moneyDisplay.id = 'shop-money';
    moneyDisplay.style.cssText = `
        color: #00ff00;
        font-size: 18px;
        font-weight: bold;
    `;
    moneyDisplay.textContent = `💰 $${this.game.progression.money}`;
    
    header.appendChild(title);
    header.appendChild(moneyDisplay);
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
        position: absolute;
        top: 10px;
        right: 10px;
        background: #ff0000;
        color: white;
        border: none;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        z-index: 2001;
    `;
    closeButton.onclick = () => {
        document.body.removeChild(overlay);
    };
    
    // Shop content
    const content = document.createElement('div');
    content.style.cssText = `
        padding: 20px;
        overflow-y: auto;
        flex: 1;
    `;
    
    // Generate item list
    const itemList = document.createElement('div');
    itemList.style.cssText = `
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        gap: 15px;
    `;
    
    // Available power-ups based on zone level
    const availablePowerUps = this.getAvailablePowerUps(zone);
    
    availablePowerUps.forEach(item => {
        const itemCard = this.createItemCard(item, zone);
        itemList.appendChild(itemCard);
    });
    
    content.appendChild(itemList);
    
    shopWindow.appendChild(header);
    shopWindow.appendChild(content);
    overlay.appendChild(shopWindow);
    overlay.appendChild(closeButton);
    
    document.body.appendChild(overlay);
}

/**
 * Get available power-ups for black market based on zone level
 * @param {Zone} zone - Black market zone
 * @returns {Array} Available power-ups
 */
getAvailablePowerUps(zone) {
    // Define shop inventory
    const shopInventory = {
        health: {
            id: 'health',
            name: 'Health Pack',
            description: 'Restores 50 health points',
            price: 100,
            icon: '❤️',
            type: 'health',
            value: 50,
            duration: 0
        },
        ammo: {
            id: 'ammo',
            name: 'Ammo Pack',
            description: 'Refills current weapon ammo',
            price: 150,
            icon: '🔫',
            type: 'ammo',
            value: 0,
            duration: 0
        },
        speed: {
            id: 'speed',
            name: 'Speed Boost',
            description: 'Increases speed by 50% for 10 seconds',
            price: 200,
            icon: '⚡',
            type: 'speed',
            value: 1.5,
            duration: 10000
        },
        damage: {
            id: 'damage',
            name: 'Damage Boost',
            description: 'Doubles weapon damage for 15 seconds',
            price: 250,
            icon: '💥',
            type: 'damage',
            value: 2.0,
            duration: 15000
        },
        rapid_fire: {
            id: 'rapid_fire',
            name: 'Rapid Fire',
            description: 'Increases fire rate by 70% for 12 seconds',
            price: 300,
            icon: '🔥',
            type: 'rapid_fire',
            value: 0.3,
            duration: 12000
        },
        multi_shot: {
            id: 'multi_shot',
            name: 'Multi Shot',
            description: 'Fires 3 bullets per shot for 10 seconds',
            price: 350,
            icon: '🎯',
            type: 'multi_shot',
            value: 3,
            duration: 10000
        },
        invincibility: {
            id: 'invincibility',
            name: 'Invincibility',
            description: 'Become invincible for 8 seconds',
            price: 500,
            icon: '🛡️',
            type: 'invincibility',
            value: 1,
            duration: 8000
        },
        explosive_ammo: {
            id: 'explosive_ammo',
            name: 'Explosive Ammo',
            description: 'All bullets explode on impact for 20 seconds',
            price: 450,
            icon: '💣',
            type: 'explosive_ammo',
            value: 1,
            duration: 20000
        },
        boost_refill: {
            id: 'boost_refill',
            name: 'Boost Refill',
            description: 'Refills vehicle boost by 50 points',
            price: 120,
            icon: '🚀',
            type: 'boost_refill',
            value: 50,
            duration: 0
        }
    };
    
    // Filter available items based on zone level
    let availableItems = [
        shopInventory.health,
        shopInventory.ammo,
        shopInventory.speed,
        shopInventory.damage
    ];
    
    if (zone.level >= 2) {
        availableItems.push(
            shopInventory.rapid_fire,
            shopInventory.multi_shot
        );
    }
    
    if (zone.level >= 3) {
        availableItems.push(
            shopInventory.invincibility,
            shopInventory.explosive_ammo
        );
    }
    
    // Always include boost refill
    availableItems.push(shopInventory.boost_refill);
    
    return availableItems;
}

/**
 * Create item card for shop
 * @param {Object} item - Item data
 * @param {Zone} zone - Black market zone
 * @returns {HTMLElement} Item card element
 */
createItemCard(item, zone) {
    const card = document.createElement('div');
    card.style.cssText = `
        background: rgba(128, 0, 128, 0.3);
        border: 1px solid #800080;
        border-radius: 8px;
        padding: 15px;
        display: flex;
        flex-direction: column;
        cursor: pointer;
        transition: all 0.2s;
    `;
    
    card.onmouseover = () => {
        card.style.background = 'rgba(128, 0, 128, 0.5)';
        card.style.transform = 'translateY(-2px)';
    };
    
    card.onmouseout = () => {
        card.style.background = 'rgba(128, 0, 128, 0.3)';
        card.style.transform = 'translateY(0)';
    };
    
    // Item icon and name
    const header = document.createElement('div');
    header.style.cssText = `
        display: flex;
        align-items: center;
        margin-bottom: 10px;
    `;
    
    const icon = document.createElement('span');
    icon.style.cssText = `
        font-size: 24px;
        margin-right: 10px;
    `;
    icon.textContent = item.icon;
    
    const name = document.createElement('h3');
    name.style.cssText = `
        margin: 0;
        color: #fff;
        font-size: 16px;
    `;
    name.textContent = item.name;
    
    header.appendChild(icon);
    header.appendChild(name);
    
    // Item description
    const description = document.createElement('p');
    description.style.cssText = `
        color: #ccc;
        font-size: 12px;
        margin: 0 0 15px 0;
        flex: 1;
    `;
    description.textContent = item.description;
    
    // Price and purchase button
    const footer = document.createElement('div');
    footer.style.cssText = `
        display: flex;
        justify-content: space-between;
        align-items: center;
    `;
    
    const price = document.createElement('div');
    price.style.cssText = `
        color: #00ff00;
        font-weight: bold;
    `;
    price.textContent = `$${item.price}`;
    
    const purchaseButton = document.createElement('button');
    purchaseButton.textContent = 'Buy';
    purchaseButton.style.cssText = `
        background: #800080;
        color: white;
        border: none;
        padding: 5px 10px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 12px;
    `;
    
    // Check if player can afford item
    if (this.game.progression.money < item.price) {
        purchaseButton.disabled = true;
        purchaseButton.style.background = '#666';
        purchaseButton.title = 'Insufficient funds';
    } else {
        purchaseButton.onclick = () => {
            this.purchaseItem(item, zone);
        };
    }
    
    footer.appendChild(price);
    footer.appendChild(purchaseButton);
    
    card.appendChild(header);
    card.appendChild(description);
    card.appendChild(footer);
    
    return card;
}

/**
 * Purchase item from black market
 * @param {Object} item - Item to purchase
 * @param {Zone} zone - Black market zone
 */
purchaseItem(item, zone) {
    // Check if player has enough money
    if (this.game.progression.money < item.price) {
        this.showShopMessage('Insufficient funds!', '#ff0000');
        return;
    }
    
    // Deduct money
    this.game.progression.spendMoney(item.price, `black_market_${item.id}`);
    
    // Update money display
    const moneyDisplay = document.getElementById('shop-money');
    if (moneyDisplay) {
        moneyDisplay.textContent = `💰 $${this.game.progression.money}`;
    }
    
    // Give player the power-up
    if (this.game.powerUpManager) {
        this.game.powerUpManager.givePlayerPowerUp(item.type);
    }
    
    // Show success message
    this.showShopMessage(`Purchased ${item.name}!`, '#00ff00');
    
    // Update purchase button states
    this.updatePurchaseButtons();
    
    // Set cooldown on zone
    zone.cooldownTimer = zone.cooldownDuration;
}
```

### 3. Zone Integration
Update the black market zone interaction to show the shop UI:

```javascript
// In zones.js, update the openBlackMarket method
openBlackMarket() {
    // Show black market shop UI instead of giving random power-up
    if (this.game.ui) {
        this.game.ui.showBlackMarketShop(this);
    } else {
        // Fallback to original behavior
        if (this.game.powerUpManager) {
            const powerUpType = this.powerUpTypes[Math.floor(Math.random() * this.powerUpTypes.length)];
            this.game.powerUpManager.givePlayerPowerUp(powerUpType);
            
            this.cooldownTimer = this.cooldownDuration;
            
            this.game.addTextEffect(this.x + this.width/2, this.y + this.height + 10, 
                `Power-up acquired!`, '#800080', 2000);
                
            if (this.game.audioManager) {
                this.game.audioManager.playSound('powerup_pickup', this.x, this.y);
            }
        }
    }
}
```

## Business Logic

### Transaction System
1. **Money Validation**: Check player has sufficient funds before purchase
2. **Deduction**: Subtract item cost from player money
3. **Item Delivery**: Apply power-up effect to player
4. **Cooldown**: Set zone cooldown to prevent spam purchases
5. **Feedback**: Show success/error messages

### Pricing Strategy
- Basic power-ups: $100-200
- Intermediate power-ups: $250-350
- Advanced power-ups: $450-500
- Utility items: $120-150

Prices scale with zone level to provide progression.

## Integration Points

### UI System
- Add shop interface methods to existing UI class
- Extend updateCompactHUD to show money changes
- Add shop message display system

### PowerUpManager
- Implement missing `givePlayerPowerUp` method
- Ensure proper sound and visual effects

### Zone System
- Modify black market zone interaction
- Maintain existing visual elements

### Progression System
- Utilize existing money management
- Record black market purchases for statistics

## Testing Strategy

### Unit Tests
1. Test `givePlayerPowerUp` method functionality
2. Test shop item availability based on zone levels
3. Test money deduction and validation
4. Test UI element creation

### Integration Tests
1. Test full purchase flow from UI interaction to power-up application
2. Test cooldown functionality
3. Test insufficient funds handling
4. Test zone level progression

### UI Tests
1. Test shop window appearance and positioning
2. Test item card rendering
3. Test responsive design
4. Test interaction feedback

## Security Considerations

1. **Server-side Validation**: In a multiplayer context, validate transactions server-side
2. **Data Integrity**: Ensure shop inventory cannot be manipulated client-side
3. **Cheat Prevention**: Implement anti-cheat measures for money values

## Performance Considerations

1. **DOM Efficiency**: Minimize DOM operations in shop UI
2. **Memory Management**: Properly clean up UI elements when closing shop
3. **Event Listeners**: Remove event listeners to prevent memory leaks
4. **Asset Loading**: Use existing game assets where possible

## Future Enhancements

1. **Sell Interface**: Allow players to sell items back to the black market
2. **Special Items**: Add unique items not available elsewhere
3. **Shop Upgrades**: Allow players to upgrade black market zones
4. **Quest Integration**: Special black market items for quest completion
5. **Rarity System**: Implement rare/legendary power-ups