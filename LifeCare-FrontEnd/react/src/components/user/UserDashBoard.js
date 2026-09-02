import DashboardShell from "../common/DashboardShell";
import {
  IconAmbulance,
  IconBed,
  IconClipboard,
  IconDroplet,
  IconOxygen,
  IconStethoscope,
} from "../common/Icons";

const ACTIONS = [
  {
    to: "/bedavailability",
    icon: <IconBed />,
    title: "Book a bed",
    text: "Check which hospitals have beds free and send a booking request.",
    cta: "Find a bed",
  },
  {
    to: "/bloodavailability",
    icon: <IconDroplet />,
    title: "Blood availability",
    text: "Search every blood group across the hospitals on the portal.",
    cta: "Search blood",
    variant: "btn-outline-primary",
  },
  {
    to: "/oxygenavailability",
    icon: <IconOxygen />,
    title: "Oxygen availability",
    text: "See which hospitals have oxygen cylinders in stock right now.",
    cta: "Search oxygen",
    variant: "btn-outline-primary",
  },
  {
    to: "/bookingstatus",
    icon: <IconClipboard />,
    title: "Booking status",
    text: "Follow your requests and see what each hospital decided.",
    cta: "View status",
    variant: "btn-outline-primary",
  },
  {
    to: "/ambulancecontact",
    icon: <IconAmbulance />,
    title: "Ambulance contacts",
    text: "Verified ambulance numbers for each hospital on the portal.",
    cta: "View contacts",
    variant: "btn-outline-primary",
  },
  {
    to: "/doctorinfo",
    icon: <IconStethoscope />,
    title: "Find a doctor",
    text: "Browse specialists by hospital, with qualifications and contact details.",
    cta: "Find a doctor",
    variant: "btn-outline-primary",
  },
];

export default function UserDashBoard() {
  return (
    <DashboardShell
      role="user"
      title="Welcome,"
      subtitle="Search availability, book a bed and track your requests."
      actions={ACTIONS}
    />
  );
}
