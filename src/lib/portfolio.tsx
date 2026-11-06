import type { ReactNode } from 'react';

function A({ children, href }: { children: ReactNode; href: string }) {
  return (
    <a href={href} rel="noreferrer">
      {children}
    </a>
  );
}

export const portrait: { alt: string; src: string } | null = {
  alt: 'Nasrul Huda smiling while sitting by the window on a train',
  src: '/static/images/portrait.jpg',
};

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
    alt: 'Regulaido wordmark above three document cards labelled Reviews, Evidence and Drafts, closing on the line Every claim, sourced',
    copy: [
      <p key="body">
        Regulaido is an agentic platform for medical writing from Pharos Labs.
        Specialist agents handle systematic reviews, document research,
        drafting, and review, while an orchestrator routes each request and
        keeps the evidence traceable from source to final document.
      </p>,
      <p key="body">
        I worked as an AI Engineer across the agentic workflows and the product
        around them: building agent flows, shipping frontend components, and
        fixing bugs throughout the interface medical writers use every day.
      </p>,
      <p key="link">
        Learn more about the product{' '}
        <A href="https://pharos-labs.com/regulaido">here</A>.
      </p>,
      <p key="role">My Role: AI Engineer at Pharos Labs.</p>,
    ],
    poster: '/static/images/work/regulaido.jpg',
    title: 'Regulaido by Pharos Labs',
    video: '/static/images/work/regulaido.mp4',
    year: '2026',
  },
  {
    alt: 'Fleet window with two agent terminals and a diff panel for the focused session',
    copy: [
      <p key="body">
        Fleet is a macOS workspace for running installed coding-agent CLIs side
        by side. A Rust daemon owns every agent process and its PTY, so closing
        the window leaves the sessions running and the app reattaches when you
        come back. Each pane is a real terminal, with a context panel that
        follows the focused agent's working tree.
      </p>,
      <p key="link">
        The <A href="https://github.com/nsrul/fleet">Fleet repository</A> has
        the release and the architecture.
      </p>,
      <p key="role">My Role: Product and engineering.</p>,
    ],
    poster: '/static/images/work/fleet.jpg',
    title: 'Fleet',
    year: '2026',
  },
  {
    alt: 'Tally popover showing daily and monthly spend against budgets',
    copy: [
      <p key="body">
        Tally is a macOS menu bar app for watching LLM spend and subscription
        quotas. It reads LiteLLM gateway spend and the plans already signed in
        on the Mac, tracks daily and monthly budgets, and warns before either
        one is exceeded.
      </p>,
      <p key="link">
        The <A href="https://github.com/nsrul/tally">Tally repository</A> has
        the app and the gateway connector.
      </p>,
      <p key="role">My Role: Product and engineering.</p>,
    ],
    poster: '/static/images/work/tally.jpg',
    title: 'Tally',
    video: '/static/images/work/tally.mp4',
    year: '2026',
  },
  {
    alt: 'MLdrills practice screen',
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
    poster: '/static/images/work/mldrills.png',
    title: 'MLdrills',
    video: '/static/images/work/mldrills.mp4',
    year: '2026',
  },
  {
    alt: 'SynTwin logo',
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
    poster: '/static/images/work/syntwin.png',
    title: 'SynTwin',
    year: '2026',
  },
  {
    alt: "Mirage wordmark and cube mark on black, with the line The World's First Virtual Terminal for AI Agents",
    copy: [
      <p key="body">
        Mirage is a virtual terminal for AI agents from Strukto.ai. One shell
        sits over files, commands, and runtimes, so an agent reaches each
        service with the Unix tools it already knows. I contributed the
        Nextcloud compatibility and integration.
      </p>,
      <p key="link">
        The{' '}
        <A href="https://github.com/strukto-ai/mirage">Mirage repository</A> is
        open source.
      </p>,
    ],
    poster: '/static/images/work/mirage.png',
    title: 'Mirage by Strukto.ai',
    year: '2026',
  },
  {
    alt: 'ACL Anthology title card, Unified RAG Pipeline for Research, beside documents feeding a database',
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
      <p key="role">My Role: Course project.</p>,
    ],
    poster: '/static/images/work/acl-anthology.jpg',
    title: 'ACL Anthology Search',
    year: '2026',
  },
  {
    alt: 'Title card for Federated Fine-Tuning and Zero-Shot Application of Nicheformer for Spatial Transcriptomics',
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
      <p key="role">My Role: Course project.</p>,
    ],
    poster: '/static/images/work/nicheformer.jpg',
    title: 'Federated Nicheformer',
    year: '2026',
  },
  {
    alt: 'A diagram of the bioacoustic training loop, from features and episodic sampling through the encoder, prototypes, and loss',
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
    poster: '/static/images/work/bioacoustic.jpg',
    title: 'Bioacoustic Sound Classification',
    year: '2026',
  },
  {
    alt: 'The 2025 nasrul.info homepage in a browser window, menu open, with a green pixel figure on a dark grid',
    copy: [
      <p key="body">
        This was nasrul.info through 2025. Home was a dark outliner for what I
        was doing, the menu opened onto work, consulting, writing, and
        resources, and each project had its own page. A pixel figure sat on the
        grid behind the type, and clicking a cell played a piano note.
      </p>,
      <p key="link">
        Check it out <A href="https://2025.nasrul.info">here</A>.
      </p>,
      <p key="role">My Role: Design and engineering.</p>,
    ],
    poster: '/static/images/work/nasrul-info.jpg',
    title: 'nasrul.info',
    year: '2025',
  },
  {
    alt: 'PETTOO wordmark in white on a green field',
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
    poster: '/static/images/work/pettoo.jpg',
    title: 'Pettoo',
    year: '2025',
  },
  {
    alt: 'A line drawing of a neural network with connected nodes',
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
    poster: '/static/images/work/mytorch.jpg',
    title: 'MyTorch',
    year: '2025',
  },
  {
    alt: 'A silent walkthrough of the Discourse Analysis Tool Suite, from the welcome card through the analysis workspace',
    copy: [
      <p key="body">
        The Discourse Analysis Tool Suite is a shared application for
        researchers working through large text collections, in place of a
        notebook only its author can run. I built the interface, the services,
        and the analysis paths behind them at the Language Technology Lab.
      </p>,
      <p key="link">
        The documentation is at <A href="https://dats.science">dats.science</A>.
        The{' '}
        <A href="https://dats.ltdemos.informatik.uni-hamburg.de">demo</A>{' '}
        runs on the university host.
      </p>,
      <p key="role">My Role: Research Assistant.</p>,
    ],
    poster: '/static/images/work/dats.jpg',
    title: 'Discourse Analysis Tool Suite',
    video: '/static/images/work/dats.mp4',
    year: '2025',
  },
];

export const contributions: Project[] = [
  {
    alt: "Mirage wordmark and cube mark on black, with the line The World's First Virtual Terminal for AI Agents",
    copy: [
      <p key="body">
        Mirage is a virtual terminal for AI agents from Strukto.ai. One shell
        sits over files, commands, and runtimes, so an agent reaches each
        service with the Unix tools it already knows. I contributed the
        Nextcloud compatibility and integration.
      </p>,
      <p key="link">
        The{' '}
        <A href="https://github.com/strukto-ai/mirage">Mirage repository</A> is
        open source.
      </p>,
    ],
    poster: '/static/images/work/mirage.png',
    title: 'Mirage by Strukto.ai',
    year: '2026',
  },
  {
    alt: 'A silent walkthrough of the Discourse Analysis Tool Suite, from the welcome card through the analysis workspace',
    copy: [
      <p key="body">
        The Discourse Analysis Tool Suite is a shared application for
        researchers working through large text collections, in place of a
        notebook only its author can run. I built the interface, the services,
        and the analysis paths behind them at the Language Technology Lab.
      </p>,
      <p key="link">
        The documentation is at <A href="https://dats.science">dats.science</A>.
        The{' '}
        <A href="https://dats.ltdemos.informatik.uni-hamburg.de">demo</A>{' '}
        runs on the university host.
      </p>,
    ],
    poster: '/static/images/work/dats.jpg',
    title: 'Discourse Analysis Tool Suite',
    video: '/static/images/work/dats.mp4',
    year: '2025',
  },
];
