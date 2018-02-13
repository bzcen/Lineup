#include <iostream>
#include <fstream>
#include <stdlib.h>
#include <string>
#include <vector>
#include "score_calculator.hpp"
#include <sstream>

/* EXPECTED FORMAT OF INPUT
<numCharacters>
for every characters...
    <name>
    <hp>
    <numCombatActions>
    for every combat Action...
        <numPositions/keywords>
        <all positions and keywords space-delimited>
        <numTargets>
        <all targets space-delimited>
        <dmg>
    <numAbilities>
    for every ability...
        <flexibilityRating>
        <impactRating>
    <factionBonus>
*/


// Global variables cause we're bad
std::vector<Character> characters;
// weights for calculating overall character score
const double HP_WEIGHT = 0.06;
const double COMBAT_ACTIONS_WEIGHT = 0.33;
const double ABILITIES_WEIGHT = 0.33;
// weights for calculating combat action score
const double COMBAT_ACTIONS_FLEXIBILITY_WEIGHT = 0.33;
const double COMBAT_ACTIONS_RANGE_WEIGHT = 0.33;
const double COMBAT_ACTIONS_DMG_WEIGHT = 0.33;
// weights for calculating ability score
const double ABILITIES_FLEXIBILITY_WEIGHT = 0.5;
const double ABILITIES_IMPACT_WEIGHT = 0.5;

bool is_position(const std::string &str)
{
    return str.find_first_not_of("1234") == std::string::npos;
}

int readIntFromLine(std::ifstream& input)
{
    std::string temp;
    std::getline(input, temp);
    // std::stoi is a c++11 function.
    return std::stoi(temp);
}

double readDoubleFromLine(std::ifstream& input)
{
    std::string temp;
    std::getline(input, temp);
    return std::stod(temp);
}

void parseCharacter(std::ifstream& input) {
    std::string temp;

    // read the name
    std::getline(input, temp);    
    std::string name = temp;
    // read the hp
    int hp = readIntFromLine(input);

    // read the combat Actions
    int numCombatActions = readIntFromLine(input);
    std::vector<CombatAction> combatActions;
    for (int i = 0; i < numCombatActions; i++) {
        // conditions(positions/keywords)
        int numConditions = readIntFromLine(input);
        std::vector<int> positions;
        std::vector<std::string> keywords;
        std::getline(input, temp);
        std::stringstream ss(temp);
        for (int j = 0; j < numConditions; j++) {
            std::string temp2;
            ss >> temp2;
            if (is_position(temp2)) {
                positions.push_back(std::stoi(temp2));
            } else {
                keywords.push_back(temp2);
            }
        }

        // targets
        int numTargets = readIntFromLine(input);
        std::vector<int> targets;
        std::getline(input, temp);
        for (int j = 0; j < numTargets; j++) {
            int temp2;
            ss >> temp2;
            targets.push_back(temp2);
        }

        // damage
        int damage = readIntFromLine(input);

        CombatAction c = {positions, keywords, targets, damage};
        combatActions.push_back(c);
    }

    // read abilities
    int numAbilities = readIntFromLine(input);
    std::vector<Ability> abilities;
    for (int i = 0; i < numAbilities; i++) {
        // flexibility rating
        double flexibilityRating = readDoubleFromLine(input);
        // impact rating
        double impactRating = readDoubleFromLine(input);

        Ability a = {flexibilityRating, impactRating};
        abilities.push_back(a);
    }

    // factionBonus
    double factionBonus = readDoubleFromLine(input);

    Character c = {name, hp, combatActions, abilities, factionBonus};
    characters.push_back(c);
}

double calculateAbilityScore(const Ability& a) {
    return ABILITIES_FLEXIBILITY_WEIGHT * a.flexibilityRating + ABILITIES_IMPACT_WEIGHT * a.impactRating;
}

double calculateCombatActionScore(const CombatAction& c) {
    double flexibilityRating = 0.0;
    for (int i = 0; i < c.positions.size(); i++) {
        flexibilityRating += 0.25;
    }
    //TODO(bcen): make this actually check what the keyword says
    for (int i = 0; i < c.keywords.size(); i++) {
        flexibilityRating -= 0.75;
    }

    double rangeRating = 0.0;
    for (int i = 0; i < c.targets.size(); i++) {
        if (c.targets[i] == 1 || c.targets[i] == 2) {
            rangeRating += 0.2;
        } else {
            rangeRating += 0.3;
        }
    }

    return COMBAT_ACTIONS_FLEXIBILITY_WEIGHT * flexibilityRating + COMBAT_ACTIONS_RANGE_WEIGHT * rangeRating + COMBAT_ACTIONS_DMG_WEIGHT + c.damage;
}

double calculateCharacterScore(const Character& c) {
    double combatActionsScore = 0.0;
    for (int i = 0; i < c.combatActions.size(); i++) {
        combatActionsScore += calculateCombatActionScore(c.combatActions[i]);
    }
    double abilitiesScore = 0.0;
    for (int i = 0; i < c.abilities.size(); i++) {
        abilitiesScore += calculateAbilityScore(c.abilities[i]);
    }

    return HP_WEIGHT * c.hp + COMBAT_ACTIONS_WEIGHT * combatActionsScore + ABILITIES_WEIGHT * abilitiesScore + c.factionBonus;
}

int main() {
    std::cout << "Calculating..." << std::endl;

    // grab the input file
    std::ifstream input("score_calculator_input.txt");
    
    int numCharacters = readIntFromLine(input);
    for (int i = 0; i < numCharacters; i++) {
        parseCharacter(input);
    }

    for (int i = 0; i < characters.size(); i++) {
        std::cout << characters[i].name << " has a rating of " << calculateCharacterScore(characters[i]) << std::endl;
    }
}