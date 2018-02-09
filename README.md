# Lineup
Card Game in Progress

## How To Run
+ Inside `./lineup/`, run `DEBUG=lineup:* npm run devstart`
+ On browser, go to `127.0.0.1:3000`

## Design Spreadsheet

https://docs.google.com/spreadsheets/d/19YSdbDIrYURknm8D67S7bl1fV4q1Wg_i6ntb2bHrKm4/edit?usp=sharing

## Task List:

- [ ] Basic AI with a preset deck
- [ ] Deck/Lineup creation screen
- [ ] Data Metrics when game concludes
- [ ] Load from Preset Loadouts (in form of JSON)
- [ ] Hiding Player 2 Information if playing with AI
- [ ] "Functionize" some of the End of Turn and End of Combat (would need to rearrange the character.json build)
- [ ] Energy
- [ ] Think of how to resolve multiple conditions in a single combat action, especially if it's an OR conditional (ie. Eager OR 1/2). This will likely need to rearrange character.json build.
- [ ] Improve visibility/design of character card text
- [ ] Reorganize the code base for better code management
- [x] Add better visual feedback for dealing DMG
- [x] Improve performance of calculating DMG functions (reduce latency of promises)
- [ ] Add visual feedback for temporary "buffs"
- [ ] modularize the way we confirm if object properties exist (especially when read from JSON)
- [x] Move faction bonuses to a separate JSON
- [ ] Combine "conditions" and "position", it effectively means the same thing
- [ ] Combine combat actions, abilities, and faction bonus into one generalized class that the character class can simply hold and call functions of
- [ ] Modularize into a Game class (that tracks phases, characters defeated in a round, etc)
- [ ] Refactor any phase effects into one function
