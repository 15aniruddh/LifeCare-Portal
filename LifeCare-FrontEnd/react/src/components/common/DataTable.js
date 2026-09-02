import { IconInbox } from "./Icons";

/**
 * A table inside a rounded card. The table scrolls horizontally inside the
 * card on narrow screens so the page itself never scrolls sideways.
 *
 * `columns` is an array of { key, label, align?, render? }.
 */
export default function DataTable({ columns, rows, rowKey, emptyMessage }) {
  if (!rows || rows.length === 0) {
    return (
      <div className="table-card">
        <div className="empty-state">
          <IconInbox size={44} />
          <p className="mb-0">{emptyMessage || "Nothing to show yet."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={column.align === "end" ? "text-end" : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={rowKey ? rowKey(row) : index}>
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={column.align === "end" ? "text-end" : undefined}
                  >
                    {column.render ? column.render(row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
