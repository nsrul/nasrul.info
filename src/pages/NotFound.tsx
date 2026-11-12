import IdentityPane, { SectionNav } from '@components/IdentityPane';
import { Link } from '@tanstack/react-router';

export default function NotFound() {
  return (
    <div className="portfolio">
      <SectionNav current={null} />
      <IdentityPane />
      <main aria-label="Not found" className="pane-b">
        <p className="lede">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <p className="note">
          <Link to="/">Go back home</Link>
        </p>
      </main>
    </div>
  );
}
