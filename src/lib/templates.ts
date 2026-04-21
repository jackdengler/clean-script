export type TemplateId = 'three-act' | 'save-the-cat' | 'heros-journey' | 'freeform';

export interface TemplateInfo {
  id: TemplateId;
  name: string;
  description: string;
  body: string;
}

const threeAct = `# Outline — Three-Act Structure

## Act 1 — Setup

### Opening / Status Quo


### Inciting Incident


### Plot Point 1 (Into Act 2)


## Act 2 — Confrontation

### Rising Action


### Midpoint


### Plot Point 2 (Into Act 3)


## Act 3 — Resolution

### Climax


### Resolution / New Normal

`;

const saveTheCat = `# Outline — Save the Cat Beat Sheet

## 1. Opening Image


## 2. Theme Stated


## 3. Setup


## 4. Catalyst


## 5. Debate


## 6. Break Into Two


## 7. B Story


## 8. Fun and Games


## 9. Midpoint


## 10. Bad Guys Close In


## 11. All Is Lost


## 12. Dark Night of the Soul


## 13. Break Into Three


## 14. Finale


## 15. Final Image

`;

const herosJourney = `# Outline — Hero's Journey (12 Stages)

## 1. Ordinary World


## 2. Call to Adventure


## 3. Refusal of the Call


## 4. Meeting the Mentor


## 5. Crossing the Threshold


## 6. Tests, Allies, Enemies


## 7. Approach to the Inmost Cave


## 8. The Ordeal


## 9. Reward (Seizing the Sword)


## 10. The Road Back


## 11. Resurrection


## 12. Return with the Elixir

`;

const freeform = `# Outline

## Notes

`;

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'three-act',
    name: 'Three-act structure',
    description: 'Classic setup / confrontation / resolution with key plot points.',
    body: threeAct,
  },
  {
    id: 'save-the-cat',
    name: 'Save the Cat beat sheet',
    description: 'Blake Snyder’s 15 beats — popular for screenwriting.',
    body: saveTheCat,
  },
  {
    id: 'heros-journey',
    name: "Hero's Journey",
    description: 'Campbell / Vogler 12-stage monomyth.',
    body: herosJourney,
  },
  {
    id: 'freeform',
    name: 'Freeform',
    description: 'Start from an empty outline and shape your own.',
    body: freeform,
  },
];

export function templateById(id: string): TemplateInfo {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[3];
}
