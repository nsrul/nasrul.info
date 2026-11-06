export type Photo = {
  alt: string;
  date?: string;
  src: string;
  title: string;
};

export const photos: Photo[] = [
  {
    alt: 'A glass grid skylight above dark ornate gallery arches and framed paintings.',
    src: '/static/images/photography/skylight.jpg',
    title: 'Skylight',
  },
  {
    alt: 'A standing figure draped in a heavy mottled cloak in a blue gallery, with two people nearby.',
    src: '/static/images/photography/cloak.jpg',
    title: 'Cloak',
  },
  {
    alt: 'A gold frame around a painting of a young man holding a lit lantern, on a gray wall.',
    src: '/static/images/photography/lantern.jpg',
    title: 'Lantern',
  },
  {
    alt: 'A dark paved courtyard at night under a lit metal walkway between two buildings.',
    src: '/static/images/photography/courtyard.jpg',
    title: 'Courtyard',
  },
  {
    alt: 'A white doorway opening onto a checkered marble floor, a dark balustrade, and landscape paintings under gilded arches.',
    src: '/static/images/photography/museum.jpg',
    title: 'Museum',
  },
];
