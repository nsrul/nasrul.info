import type { ReactNode } from 'react';

function A({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a href={href} rel="noreferrer">
      {children}
    </a>
  );
}

// Set when a 3:4 photo is at public/static/images/portrait.jpg.
export const portrait: { alt: string; src: string } | null = null;

export const contact = [{ href: 'mailto:hi@nasrul.info', label: 'Email' }];

export type Project = {
  alt: string;
  copy: ReactNode[];
  poster?: string;
  title: string;
  video?: string;
  webm?: string;
  year: string;
};

export const projects: Project[] = [
  {
    alt: '',
    copy: [
      <p key="body">
        Zeus is a native macOS workbench for running coding agents in parallel
        without losing their terminals. A background engine keeps each session
        alive after the window closes, and a sidebar reduces the state to
        working, waiting, or done.
      </p>,
      <p key="link">
        The <A href="https://nsrul.github.io/zeus">Zeus docs</A> cover the
        workbench.
      </p>,
      <p key="role">My Role: Product and engineering.</p>,
    ],
    title: 'Zeus',
    year: '2026',
  },
  {
    alt: 'MLdrills editor showing a solved machine-learning problem',
    copy: [
      <p key="body">
        MLdrills is a practice platform for machine-learning problems you solve
        in the browser. Drills, tracks, and larger projects stay with the
        account, and grading runs in an isolated Python environment so the
        hidden tests never sit in the client.
      </p>,
      <p key="link">
        <A href="https://mldrills.com">MLdrills</A> is live and still in
        development.
      </p>,
      <p key="role">My Role: Product and engineering.</p>,
    ],
    poster: '/static/images/work/mldrills.webp',
    title: 'MLdrills',
    year: '2026',
  },
  {
    alt: 'SynTwin voice agent listening during a call',
    copy: [
      <p key="body">
        SynTwin is the platform and the agents that carry digital-twin workflows
        through long conversations. I worked on the orchestration, the prompts,
        and the call interface, so a tool that fails halfway through a turn does
        not take the rest of the session with it.
      </p>,
      <p key="link">
        The public product is <A href="https://syntwin.ai">SynTwin</A>.
      </p>,
      <p key="role">My Role: AI Engineer.</p>,
    ],
    poster: '/static/images/work/syntwin.webp',
    title: 'SynTwin',
    year: '2026',
  },
  {
    alt: '',
    copy: [
      <p key="body">
        ACL Anthology Search finds papers by what they mean, not by the keywords
        they happen to use. A question in plain language, or a paper you already
        have, comes back as an answer with citations.
      </p>,
      <p key="link">
        You can try the{' '}
        <A href="https://acla.nasrul.info">ACL Anthology Search demo</A>.
      </p>,
      <p key="role">My Role: Research.</p>,
    ],
    title: 'ACL Anthology Search',
    year: '2026',
  },
  {
    alt: '',
    copy: [
      <p key="body">
        Federated Nicheformer fine-tunes a genomics model across separate
        regions of mouse brain data without moving the samples. A federated run
        reached 92.76% accuracy, against 94.45% when the same data was pooled in
        one place.
      </p>,
      <p key="link">
        The comparison is written up on{' '}
        <A href="https://github.com/nsrul/ft-nicheformer">
          Federated Nicheformer on GitHub
        </A>.
      </p>,
      <p key="role">My Role: Research.</p>,
    ],
    title: 'Federated Nicheformer',
    year: '2026',
  },
  {
    alt: '',
    copy: [
      <p key="body">
        This project trains a model to recognise animal calls from only a
        handful of labelled clips. I trained prototypical networks on log-mel
        and PCEN features, and compared a few architectures on the same episodic
        tasks.
      </p>,
      <p key="link">
        The training code is on the{' '}
        <A href="https://github.com/nsrul/prototypical-networks-bioacoustics">
          bioacoustics repository on GitHub
        </A>.
      </p>,
      <p key="role">My Role: Course project.</p>,
    ],
    title: 'Bioacoustic Sound Classification',
    year: '2026',
  },
  {
    alt: 'Pettoo homepage',
    copy: [
      <p key="body">
        Pettoo connects pet owners with services, bookings, and products in one
        backend. I designed the schema and the search, coordinated a team of
        three, and ran the API in containers on GCP.
      </p>,
      <p key="link">
        The public site is <A href="https://pettoo.de">Pettoo</A>.
      </p>,
      <p key="role">My Role: Software engineer.</p>,
    ],
    poster: '/static/images/work/pettoo.webp',
    title: 'Pettoo',
    year: '2025',
  },
  {
    alt: 'MyTorch repository readme',
    copy: [
      <p key="body">
        MyTorch is a small deep-learning library written to see what sits inside
        PyTorch. Tensors, reverse-mode differentiation, and the training loop
        are in NumPy, close to the PyTorch API, and a network trained with it
        reached 97.16% on MNIST.
      </p>,
      <p key="link">
        The <A href="https://github.com/nsrul/mytorch">MyTorch repository</A> is
        a teaching reference, not a training package.
      </p>,
      <p key="role">My Role: Product and engineering.</p>,
    ],
    poster: '/static/images/work/mytorch.webp',
    title: 'MyTorch',
    year: '2025',
  },
  {
    alt: 'Discourse Analysis Tool Suite document view',
    copy: [
      <p key="body">
        The Discourse Analysis Tool Suite is a shared application for
        researchers working through large text collections, in place of a
        notebook only its author can run. I built the interface, the services,
        and the analysis paths behind them at the Language Technology Lab.
      </p>,
      <p key="link">
        The{' '}
        <A href="https://dats.ltdemos.informatik.uni-hamburg.de">
          Discourse Analysis Tool Suite demo
        </A>{' '}
        runs on the university host.
      </p>,
      <p key="role">My Role: Research Assistant.</p>,
    ],
    poster: '/static/images/work/dats.webp',
    title: 'Discourse Analysis Tool Suite',
    year: '2025',
  },
];
