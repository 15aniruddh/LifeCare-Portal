import DashboardShell from "../common/DashboardShell";
import {
  IconBed,
  IconClipboard,
  IconDroplet,
  IconInbox,
  IconOxygen,
  IconPlus,
  IconStethoscope,
} from "../common/Icons";

const ACTIONS = [
  {
    to: "/addbed",
    icon: <IconPlus />,
    title: "Add beds",
    text: "Publish how many beds of each type your hospital has free.",
    cta: "Add beds",
  },
  {
    to: "/bedlist",
    icon: <IconBed />,
    title: "Bed list",
    text: "Review and update the bed availability you have published.",
    cta: "View beds",
    variant: "btn-outline-primary",
  },
  {
    to: "/addblood",
    icon: <IconPlus />,
    title: "Add blood stock",
    text: "Record the units available for each blood group.",
    cta: "Add blood",
  },
  {
    to: "/bloodlist",
    icon: <IconDroplet />,
    title: "Blood list",
    text: "Review the blood stock currently listed for your hospital.",
    cta: "View blood",
    variant: "btn-outline-primary",
  },
  {
    to: "/addoxygen",
    icon: <IconPlus />,
    title: "Add oxygen",
    text: "Record the oxygen cylinders your hospital can supply.",
    cta: "Add oxygen",
  },
  {
    to: "/oxygenlist",
    icon: <IconOxygen />,
    title: "Oxygen list",
    text: "Review the oxygen availability listed for your hospital.",
    cta: "View oxygen",
    variant: "btn-outline-primary",
  },
  {
    to: "/adddoctorinfo",
    icon: <IconPlus />,
    title: "Add doctor",
    text: "List a specialist along with their qualification and speciality.",
    cta: "Add doctor",
  },
  {
    to: "/doctorinfolist",
    icon: <IconStethoscope />,
    title: "Doctor list",
    text: "Review every doctor listed under your hospital.",
    cta: "View doctors",
    variant: "btn-outline-primary",
  },
  {
    to: "/approverejectrequest",
    icon: <IconInbox />,
    title: "Action on requests",
    text: "Approve or reject the bed booking requests patients have sent you.",
    cta: "Review requests",
  },
  {
    to: "/viewrequest",
    icon: <IconClipboard />,
    title: "View requests",
    text: "See the full history of requests made to your hospital.",
    cta: "View history",
    variant: "btn-outline-primary",
  },
];

export default function HospitalDashboard() {
  return (
    <DashboardShell
      role="hospital"
      title="Welcome,"
      subtitle="Publish your availability and respond to patient requests."
      actions={ACTIONS}
    />
  );
}
