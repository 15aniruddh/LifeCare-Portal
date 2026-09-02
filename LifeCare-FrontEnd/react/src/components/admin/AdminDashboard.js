import DashboardShell from "../common/DashboardShell";
import { IconHospital, IconPlus, IconUsers } from "../common/Icons";

const ACTIONS = [
  {
    to: "/addhospital",
    icon: <IconPlus />,
    title: "Add hospital",
    text: "Register a new hospital so it can publish its availability on the portal.",
    cta: "Add hospital",
  },
  {
    to: "/viewhospital",
    icon: <IconHospital />,
    title: "Hospital list",
    text: "Review, update or remove every hospital currently registered.",
    cta: "View hospitals",
    variant: "btn-outline-primary",
  },
  {
    to: "/viewuser",
    icon: <IconUsers />,
    title: "User list",
    text: "Browse the people registered on the portal and their contact details.",
    cta: "View users",
    variant: "btn-outline-primary",
  },
];

export default function AdminDashboard() {
  return (
    <DashboardShell
      role="admin"
      title="Welcome,"
      subtitle="Manage hospitals and registered users from here."
      actions={ACTIONS}
    />
  );
}
