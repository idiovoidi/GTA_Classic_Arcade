# Implementation Plan

- [x] 1. Add grenade weapon configuration to weapons system





  - Extend the `getWeaponConfig` method in `js/weapons.js` to include grenade configuration
  - Add grenade to the weapons array in Player class constructor
  - Implement `isThrowable` flag handling in weapon system
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 2. Create Grenade class with physics and explosion mechanics





  - Implement `Grenade` class in new file `js/grenade.js` with constructor, physics properties, and state management
  - Code trajectory calculation method using parabolic physics for realistic arc
  - Implement collision detection with ground and buildings using existing collision patterns
  - Add fuse timer mechanism with configurable countdown duration
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 3.1, 3.2_

- [x] 3. Implement explosion mechanics and damage system





  - Code explosion method that creates visual particle effects using existing particle system
  - Implement area-of-effect damage calculation with distance-based falloff
  - Add damage application to all entity types (player, pedestrians, police, vehicles) within blast radius
  - Create explosion sound effect integration with AudioManager
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 3.4_





- [ ] 4. Integrate grenade throwing mechanics with Player class

  - Add `throwGrenade` method to Player class that creates and launches grenade objects



  - Implement G key input handling in Player's `handleInput` method
  - Add grenade inventory management and ammo consumption logic
  - Integrate grenade throwing with existing weapon system patterns
  - _Requirements: 1.1, 1.2, 1.3, 1.4_



- [ ] 5. Add grenade management to Game class

  - Add `grenades` array to Game class constructor for tracking active grenades
  - Implement `updateGrenades` method in Game class update loop with error handling
  - Add `renderGrenades` method to Game class render loop
  - Integrate grenade cleanup and memory management with existing systems



  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 6. Implement grenade purchase system through PowerUp integration

  - Add grenade configuration to `getPowerUpConfig` method in `js/powerups.js`

  - Implement grenade purchase effect in PowerUp `applyEffect` method
  - Add inventory limit enforcement (maximum 3 grenades)
  - Integrate cost deduction and purchase validation
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 7. Update UI system to display grenade information

  - Add grenade icon to weapon display system in `js/ui.js`
  - Implement grenade count display in HUD when grenade weapon is selected
  - Update weapon switching UI to include grenade weapon
  - Add grenade availability indicator in compact HUD
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 8. Add audio integration for grenade sounds



  - Implement throw sound effect when grenade is launched
  - Add explosion sound effect with 3D positioning
  - Integrate sounds with existing AudioManager system
  - Test audio timing and volume levels for game balance
  - _Requirements: 1.4, 3.4_

- [ ] 9. Implement weapon switching integration for grenades
  - Update weapon cycling logic to include grenade weapon in rotation
  - Add grenade weapon selection via number keys (if available slot)
  - Implement weapon information display for grenade weapon type
  - Ensure proper weapon state management when switching to/from grenades
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 10. Add visual effects and rendering for grenades

  - Implement grenade sprite rendering with rotation animation
  - Add fuse warning visual indicator (flashing red) when about to explode
  - Create explosion particle effects using existing particle system
  - Implement grenade trajectory visualization during flight
  - _Requirements: 2.4, 3.3, 3.4_

- [ ] 11. Implement collision detection and physics integration
  - Add grenade collision detection with buildings using existing collision patterns
  - Implement ground collision detection and landing mechanics
  - Add bounce physics for realistic grenade behavior
  - Integrate with existing spatial grid system for performance optimization
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 12. Add balance and gameplay tuning
  - Implement self-damage mechanics when player is within blast radius
  - Add cooldown system to prevent grenade spam (1-second delay)
  - Tune damage values, explosion radius, and cost for balanced gameplay
  - Implement distance-based damage falloff calculations
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 4.2_

- [ ] 13. Create comprehensive error handling for grenade system
  - Add error handling for grenade physics calculations and edge cases
  - Implement safe array operations for grenade management using existing ErrorWrappers
  - Add validation for throw targets and collision edge cases
  - Integrate with existing game error handling system
  - _Requirements: All requirements - error handling is cross-cutting_

- [ ] 14. Write unit tests for grenade functionality
  - Create test file `test/grenade.test.js` for Grenade class functionality
  - Write tests for trajectory calculation accuracy and physics behavior
  - Add tests for explosion damage calculations and radius effects
  - Test grenade inventory management and purchase system integration
  - _Requirements: All requirements - testing validates implementation_

- [ ] 15. Integration testing and final system wiring
  - Test complete grenade workflow from purchase to explosion
  - Verify integration with all game systems (audio, UI, physics, collision)
  - Test performance with multiple active grenades and explosion effects
  - Validate weapon switching and inventory management edge cases
  - _Requirements: All requirements - integration testing ensures complete functionality_