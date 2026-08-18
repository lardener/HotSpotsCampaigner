# Scrapper Market Draw Implementation Plan

## Overview

Implement a weighted random unit draw from the scrapper market with random condition roll.

## Requirements

- Parse scrapper market markdown for units and their selection weights.
- Perform a weighted random selection.
- Roll 2D6 to determine unit condition (Nearly Impossible, Destroyed, Crippled).
- Pre-fill the combat unit editor with the drawn unit and its rolled condition.
- Do NOT modify `CombatUnit` entity.

## Markdown Format

The campaign manager defines the scrapper pool in markdown:

```markdown
| Model | Variant | BV [PV]  | Tech | Condition   | Price  | Weight | Action |
| ----- | ------- | -------- | ---- | ----------- | ------ | ------ | ------ |
| Atlas | AS7-D   | 6500 [0] | Clan | OPERATIONAL | 100000 | 10     |        |
```

- **Weight**: Optional column 7. Defaults to 1 if missing/invalid.

## Detailed Implementation Instructions

### Backend (Java)

1.  **MarkdownMarketFormatter.java**:
    - Create a local private record or static inner class `WeightedUnit` in `MarkdownMarketFormatter` to encapsulate `CombatUnit` and its `int weight`.
    - Implement `List<WeightedUnit> parseUnitTableWithWeights(String markdown)`:
      - Copy logic from `parseUnitTable`.
      - Inside the loop, parse the 7th column (`columns[6]`) as an `int`. Default to `1` if empty or non-numeric.
    - Implement `CombatUnit selectRandomUnitWithCondition(String markdown)`:
      - Call `parseUnitTableWithWeights(markdown)`.
      - Implement weighted random selection:
        - `int totalWeight = list.stream().mapToInt(w -> w.weight).sum();`
        - `int roll = ThreadLocalRandom.current().nextInt(totalWeight);`
        - Iterate through the list, accumulating weight until `cumulativeWeight > roll`.
      - Perform a 2D6 condition roll: `int conditionRoll = DiceUtils.roll(2, 6);`
      - Set status:
        - `if (conditionRoll <= 4) unit.setStatus("DESTROYED"); // Nearly Impossible`
        - `else if (conditionRoll <= 9) unit.setStatus("DESTROYED");`
        - `else unit.setStatus("CRIPPLED");`
      - Return the `CombatUnit` with updated status.

### Frontend (TypeScript/React)

1.  **useHscActionHandler.tsx**:
    - Locate `urlObj.host === 'market' && urlObj.pathname === '/scrappers/draw'`.
    - Retrieve the scrapper markdown: `const markdown = campaign.scrapperMarketMarkdown;`
    - _Note_: Since we want a robust implementation, the parsing and selection should ideally be done on the backend for consistency, or perform a full re-implementation in TS if necessary. Given the existing architecture, calling a new backend endpoint (e.g., `POST /api/market/scrappers/draw`) that returns the selected unit is recommended.
    - Create a new backend controller method:
      - `@PostMapping("/api/market/scrappers/draw")`
      - `public Mono<CombatUnit> drawScrapperUnit(@RequestBody String markdown) { ... }`
    - Frontend then calls this endpoint, gets the `CombatUnit`, and uses `selectDetachmentAndOpenEditor(unit, 'procure')`.

## Logic Flow

### 1. Condition Rules (2D6 Roll)

- **2–4 (Nearly Impossible)**: Unit starts as "DESTROYED" (with "Nearly Impossible" flavor).
- **5–9 (Destroyed)**: Unit starts as "DESTROYED".
- **10–12 (Crippled)**: Unit starts as "CRIPPLED".

### 2. Backend: `MarkdownMarketFormatter.java`

- Add `parseUnitTableWithWeights(String markdown)`:
  - Parses units and weights.
- Add `selectRandomUnitWithCondition(String markdown)`:
  - Performs weighted selection.
  - Rolls 2D6 for condition status.
  - Returns unit with pre-filled status.

### 3. Frontend: `useHscActionHandler.tsx`

- Update `hsc://market/scrappers/draw` handler:
  - Parse scrapper market markdown.
  - Select random unit and roll condition.
  - Open combat unit editor pre-filled with drawn unit.

## Verification

1. Verify weighted selection respects specified weights.
2. Verify 2D6 condition roll correctly maps to unit status.
3. Verify unit editor opens correctly with the drawn unit.
