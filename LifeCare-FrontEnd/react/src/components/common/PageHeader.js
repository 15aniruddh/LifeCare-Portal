import { Link } from "react-router-dom";

/**
 * Title row shared by the inner list and form pages: heading on the left,
 * a "Back" link on the right, wrapping onto two lines on small screens.
 */
export default function PageHeader({ title, subtitle, backTo, backLabel }) {
  return (
    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
      <div>
        <h1 className="h3 mb-1">{title}</h1>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {backTo && (
        <Link className="btn btn-outline-secondary btn-sm" to={backTo}>
          {backLabel || "Back"}
        </Link>
      )}
    </div>
  );
}
