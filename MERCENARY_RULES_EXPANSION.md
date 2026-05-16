# Plan: Mercenaries Ruleset Expansion

## Objective
Implement core "Mercenaries" mechanics including Company Ratings, Unit Market values, and Personnel Payroll.

## Feature: Company Rating (Force Strength)
- [ ] Implement logic to calculate "Force Rating" based on unit tonnage and pilot skills.
- [ ] Add a "Rating History" projection to track growth over campaigns.

## Feature: Personnel Management
- [ ] Implement "Salary" fields for Pilots.
- [ ] Add an automated Ledger entry generator for "Monthly Overhead/Payroll".
- [ ] Implement Pilot Fatigue/Injury status impacts on deployment.

## Feature: The Unit Market
- [ ] Create a `MarketService` that generates available 'Mechs based on Faction availability.
- [ ] Implement "Scrap Value" logic for the "Scrap Unit" action (returning partial SP).

## Feature: Faction Standing
- [ ] Expand `faction_reputations` to influence contract pay rates.
- [ ] Implement "Employer Reliability" modifiers.

## Success Criteria
- The system automatically calculates total command value and overhead.
- Contract offers are modified by the Command's reputation and rating.