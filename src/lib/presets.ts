/**
 * Piano arrangements for the spatial sequencer.
 *
 * Notes are `[step, midi, duration, velocity]`. Keeping performance data in the
 * preset lets the same scheduler play a clipped staccato note, a held bass
 * note, or a soft arpeggio without baking those choices into the audio engine.
 */
type PresetNote = [
  step: number,
  midi: number,
  duration: number,
  velocity: number,
];

export type Preset = {
  artist: string;
  id: string;
  label: string;
  mood: string;
  notes: PresetNote[];
  steps: number;
  stepsPerBeat: number;
  tempo: number;
};

const tripletBar = (
  start: number,
  bass: number,
  tones: number[],
): PresetNote[] => [
  [start, bass, 11.5, 0.38],
  ...Array.from(
    { length: 12 },
    (_, index) =>
      [
        start + index,
        tones[index % tones.length],
        0.92,
        index % 3 === 2 ? 0.55 : 0.44,
      ] as PresetNote,
  ),
];

const expandArrangement = (
  phrase: PresetNote[],
  phraseSteps: number,
  totalSteps: number,
): PresetNote[] => {
  const notes: PresetNote[] = [];
  for (
    let sectionStart = 0, section = 0;
    sectionStart + phraseSteps <= totalSteps;
    sectionStart += phraseSteps, section += 1
  ) {
    // The score opens quietly and gains weight over its full-length arc.
    const dynamicScale = Math.min(1.18, 0.78 + section * 0.055);
    for (const [step, midi, duration, velocity] of phrase) {
      notes.push([
        sectionStart + step,
        midi,
        duration,
        Math.min(1, velocity * dynamicScale),
      ]);
    }
  }
  return notes;
};

export const PRESETS: Preset[] = [
  {
    artist: 'Hans Zimmer',
    id: 'interstellar',
    label: 'Cornfield Chase',
    mood: 'Patient / weightless',
    notes: expandArrangement(
      [
        // Opening right-hand phrase: the repeated E pedal is what makes the
        // melody read as Cornfield Chase rather than a generic minor arpeggio.
        [0, 69, 3.5, 0.56],
        [4, 76, 7.5, 0.62],
        [12, 69, 3.5, 0.54],
        [16, 76, 7.5, 0.62],
        [24, 71, 3.5, 0.56],
        [28, 76, 7.5, 0.62],
        [36, 71, 3.5, 0.56],
        [40, 76, 7.5, 0.62],
        [48, 72, 3.5, 0.58],
        [52, 76, 7.5, 0.64],
        [60, 72, 3.5, 0.58],
        [64, 76, 7.5, 0.64],
        [72, 74, 3.5, 0.6],
        [76, 76, 7.5, 0.64],
        [84, 74, 3.5, 0.58],
        [88, 76, 3.5, 0.64],
        [92, 72, 3.5, 0.58],
        [96, 69, 1.5, 0.56],
        [98, 76, 1.5, 0.62],
        [100, 76, 3.5, 0.58],
        // Left hand follows the original A-B-C-B-A ascent beneath the phrase.
        [0, 57, 23.5, 0.38],
        [24, 59, 23.5, 0.38],
        [48, 60, 23.5, 0.4],
        [72, 59, 23.5, 0.38],
        [96, 57, 7.5, 0.38],
      ],
      104,
      840,
    ),
    steps: 840,
    stepsPerBeat: 4,
    tempo: 100,
  },
  {
    artist: 'Ludwig van Beethoven',
    id: 'moonlight-sonata',
    label: 'Moonlight Sonata',
    mood: 'Adagio / nocturnal',
    notes: [
      ...tripletBar(0, 37, [56, 61, 64]),
      ...tripletBar(12, 35, [56, 59, 63]),
      ...tripletBar(24, 33, [52, 57, 61]),
      ...tripletBar(36, 30, [49, 54, 57]),
    ],
    steps: 48,
    stepsPerBeat: 3,
    tempo: 58,
  },
  {
    artist: 'Erik Satie',
    id: 'gymnopedie',
    label: 'Gymnopédie No. 1',
    mood: 'Slow / suspended',
    notes: [
      [0, 43, 1.8, 0.42],
      [2, 50, 3.6, 0.4],
      [2, 54, 3.6, 0.36],
      [2, 59, 3.6, 0.4],
      [6, 38, 1.8, 0.42],
      [8, 45, 3.6, 0.4],
      [8, 49, 3.6, 0.36],
      [8, 54, 3.6, 0.4],
      [12, 43, 1.8, 0.42],
      [14, 50, 3.6, 0.4],
      [14, 54, 3.6, 0.36],
      [14, 59, 3.6, 0.4],
      [18, 38, 1.8, 0.42],
      [20, 45, 3.6, 0.4],
      [20, 49, 3.6, 0.36],
      [20, 54, 3.6, 0.4],
      [24, 66, 3.8, 0.62],
      [28, 69, 1.8, 0.58],
      [30, 67, 3.8, 0.56],
      [34, 66, 1.8, 0.54],
      [36, 61, 3.8, 0.58],
      [40, 59, 1.8, 0.54],
      [42, 61, 1.8, 0.55],
      [44, 62, 3.8, 0.58],
    ],
    steps: 48,
    stepsPerBeat: 2,
    tempo: 72,
  },
  {
    artist: 'Ludwig van Beethoven',
    id: 'ode-to-joy',
    label: 'Ode to Joy',
    mood: 'Bright / familiar',
    notes: [
      [0, 52, 1.7, 0.7],
      [2, 52, 1.7, 0.62],
      [4, 53, 1.7, 0.66],
      [6, 55, 1.7, 0.68],
      [8, 55, 1.7, 0.7],
      [10, 53, 1.7, 0.64],
      [12, 52, 1.7, 0.66],
      [14, 50, 1.7, 0.64],
      [16, 48, 1.7, 0.68],
      [18, 48, 1.7, 0.62],
      [20, 50, 1.7, 0.64],
      [22, 52, 1.7, 0.68],
      [24, 52, 2.7, 0.7],
      [27, 50, 0.8, 0.58],
      [28, 50, 3.6, 0.64],
      [0, 36, 7.6, 0.34],
      [8, 43, 7.6, 0.34],
      [16, 36, 7.6, 0.34],
      [24, 43, 7.6, 0.34],
    ],
    steps: 32,
    stepsPerBeat: 4,
    tempo: 88,
  },
];
