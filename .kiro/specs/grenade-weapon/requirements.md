# Requirements Document

## Introduction

This feature adds a throwable grenade/molotov weapon to the game that provides players with a powerful explosive option for strategic gameplay. The grenade will be a purchasable weapon with limited carrying capacity, physics-based throwing mechanics, and area-of-effect damage that affects all entities within its blast radius.

## Requirements

### Requirement 1

**User Story:** As a player, I want to throw grenades using the G key, so that I can deal area damage to multiple enemies at once.

#### Acceptance Criteria

1. WHEN the player presses the G key AND has the grenade weapon selected AND has grenades in inventory THEN the system SHALL throw a grenade toward the mouse cursor position
2. WHEN a grenade is thrown THEN the system SHALL consume one grenade from the player's inventory
3. WHEN the player has no grenades remaining THEN the system SHALL NOT throw a grenade when G key is pressed
4. WHEN a grenade is thrown THEN the system SHALL play a throwing sound effect

### Requirement 2

**User Story:** As a player, I want grenades to follow realistic physics, so that I can predict where they will land and plan my strategy accordingly.

#### Acceptance Criteria

1. WHEN a grenade is thrown THEN the system SHALL calculate a parabolic trajectory from the player position to the target position
2. WHEN a grenade is in flight THEN the system SHALL apply gravity to make it arc downward
3. WHEN a grenade hits the ground or a building THEN the system SHALL stop its movement and begin the fuse countdown
4. WHEN a grenade is in flight THEN the system SHALL rotate the grenade visually to show it spinning

### Requirement 3

**User Story:** As a player, I want grenades to explode after a short delay, so that I have time to take cover but enemies cannot easily escape.

#### Acceptance Criteria

1. WHEN a grenade lands THEN the system SHALL start a 2-second fuse timer
2. WHEN the fuse timer reaches zero THEN the system SHALL trigger an explosion
3. WHEN a grenade is about to explode (last 0.5 seconds) THEN the system SHALL display a visual warning indicator
4. WHEN a grenade explodes THEN the system SHALL play an explosion sound effect

### Requirement 4

**User Story:** As a player, I want grenades to deal damage to all entities within the blast radius, so that I can clear groups of enemies effectively.

#### Acceptance Criteria

1. WHEN a grenade explodes THEN the system SHALL deal damage to all entities within a 100-pixel radius
2. WHEN an entity is within the blast radius THEN the system SHALL calculate damage based on distance from explosion center
3. WHEN the player is within their own grenade's blast radius THEN the system SHALL apply self-damage to the player
4. WHEN a grenade explodes THEN the system SHALL create visual explosion particles

### Requirement 5

**User Story:** As a player, I want to purchase grenades from the black market shop, so that I can restock my explosive arsenal.

#### Acceptance Criteria

1. WHEN the player accesses the black market shop THEN the system SHALL display grenades as a purchasable item
2. WHEN the player purchases a grenade THEN the system SHALL add one grenade to their inventory if under the maximum limit
3. WHEN the player purchases a grenade THEN the system SHALL deduct the cost from their money
4. WHEN the player has maximum grenades (3) THEN the system SHALL still allow purchase but not exceed the limit

### Requirement 6

**User Story:** As a player, I want to see my grenade count in the HUD, so that I know how many grenades I have available.

#### Acceptance Criteria

1. WHEN the grenade weapon is selected THEN the system SHALL display the current grenade count in the HUD
2. WHEN the grenade count changes THEN the system SHALL update the HUD display immediately
3. WHEN the player has zero grenades THEN the system SHALL display "0/3" in the grenade counter
4. WHEN the grenade weapon is not selected THEN the system SHALL show standard weapon information

### Requirement 7

**User Story:** As a player, I want grenades to be balanced with other weapons, so that they provide strategic value without being overpowered.

#### Acceptance Criteria

1. WHEN a grenade is purchased THEN the system SHALL cost 500 game currency units
2. WHEN a player carries grenades THEN the system SHALL limit the maximum to 3 grenades
3. WHEN a grenade explodes THEN the system SHALL deal 80 base damage at the center, scaling down with distance
4. WHEN grenades are thrown THEN the system SHALL have a 1-second cooldown between throws

### Requirement 8

**User Story:** As a player, I want to switch to the grenade weapon like other weapons, so that I can integrate it into my combat strategy.

#### Acceptance Criteria

1. WHEN the player cycles through weapons THEN the system SHALL include grenades in the weapon rotation
2. WHEN the grenade weapon is selected THEN the system SHALL display appropriate weapon information
3. WHEN the player switches away from grenades THEN the system SHALL remember the remaining grenade count
4. WHEN the player switches to grenades AND has zero grenades THEN the system SHALL still allow weapon selection but prevent throwing