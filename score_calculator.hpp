#include <vector>
#include <string>

struct CombatAction {
    std::vector<int> positions;
    std::vector<std::string> keywords;
    std::vector<int> targets;
    int damage;
};

struct Ability {
    double flexibilityRating;
    double impactRating;
};

struct Character {
    std::string name;
    int hp;
    std::vector<CombatAction> combatActions;
    std::vector<Ability> abilities;
    // treated as weighted
    double factionBonus;
};