class Player {
    constructor() {
        // Character Cards
        this.cards = [];
        this.lineup = [];
        this.standby = [];
        this.defeated = [];

        // ACTION Cards
        this.actionCards = [];
        this.deck = [];
        this.discards = [];
        this.flips = [];
        this.hand = [];
    }
}

/**
 * Variables related to handling phases per round
 */
var GameState = {
    PHASE_LABELS: ["Upkeep", "Leader - Place Actions", "Non-Leader - Place Actions",  "Leader - Flip Actions", "Non-Leader - Flip Actions", "Combat", "End of Combat", "Resolve Combat", "End of Turn"],
    phaseIndex: -1,
    // track who is the leader of the round
    player1IsLeader: false
};

module.exports = {

};