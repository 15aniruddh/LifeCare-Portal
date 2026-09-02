/**
 * Inline stroke icons used across the portal.
 * They inherit colour from `currentColor` and size from the `size` prop,
 * so a parent can style them with plain CSS.
 */

const base = (size) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
});

export const IconBed = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M3 18V6" />
    <path d="M3 12h18v6" />
    <path d="M21 18v-4a3 3 0 0 0-3-3h-7" />
    <circle cx="7.5" cy="9.5" r="1.75" />
  </svg>
);

export const IconDroplet = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M12 3s5.5 5.4 5.5 9.2A5.5 5.5 0 0 1 12 18a5.5 5.5 0 0 1-5.5-5.8C6.5 8.4 12 3 12 3Z" />
  </svg>
);

export const IconOxygen = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M9 8h6" />
    <path d="M10 4h4v4h-4z" />
    <path d="M8 8h8v9a3 3 0 0 1-3 3h-2a3 3 0 0 1-3-3z" />
  </svg>
);

export const IconStethoscope = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M6 3v5a4 4 0 0 0 8 0V3" />
    <path d="M6 3H4.5M14 3h1.5" />
    <path d="M10 12v3a4 4 0 0 0 8 0v-1" />
    <circle cx="18" cy="11" r="2" />
  </svg>
);

export const IconAmbulance = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M3 16V7a1 1 0 0 1 1-1h9v10" />
    <path d="M13 9h4l4 4v3h-2" />
    <circle cx="7" cy="17" r="2" />
    <circle cx="17" cy="17" r="2" />
    <path d="M7 9.5h3M8.5 8v3" />
  </svg>
);

export const IconClipboard = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M9 4h6v3H9z" />
    <path d="M15 5.5h2a1 1 0 0 1 1 1V19a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6.5a1 1 0 0 1 1-1h2" />
    <path d="M9 12h6M9 16h4" />
  </svg>
);

export const IconHeart = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M12 20s-7-4.4-7-9.2A3.8 3.8 0 0 1 12 8a3.8 3.8 0 0 1 7 2.8C19 15.6 12 20 12 20Z" />
  </svg>
);

export const IconHospital = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M4 21V8l8-5 8 5v13" />
    <path d="M12 8.5v4M10 10.5h4" />
    <path d="M9 21v-4h6v4" />
  </svg>
);

export const IconUsers = ({ size = 24 }) => (
  <svg {...base(size)}>
    <circle cx="9" cy="8" r="3" />
    <path d="M3 20a6 6 0 0 1 12 0" />
    <path d="M16 5.5a3 3 0 0 1 0 5.8" />
    <path d="M18 20a5.5 5.5 0 0 0-3-4.9" />
  </svg>
);

export const IconShield = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M12 3l7 3v5.5c0 4.3-3 7.7-7 8.5-4-.8-7-4.2-7-8.5V6z" />
    <path d="M9.5 12l1.8 1.8 3.4-3.6" />
  </svg>
);

export const IconClock = ({ size = 24 }) => (
  <svg {...base(size)}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 1.8" />
  </svg>
);

export const IconSearch = ({ size = 24 }) => (
  <svg {...base(size)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
);

export const IconCheck = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export const IconArrowRight = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M5 12h13" />
    <path d="m12.5 6 6 6-6 6" />
  </svg>
);

export const IconPhone = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M6.5 3.5h3l1.5 4-2 1.5a12 12 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5Z" />
  </svg>
);

export const IconMail = ({ size = 24 }) => (
  <svg {...base(size)}>
    <rect x="3" y="5.5" width="18" height="13" rx="2" />
    <path d="m3.5 7 8.5 6 8.5-6" />
  </svg>
);

export const IconPin = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M12 21s7-5.6 7-11a7 7 0 1 0-14 0c0 5.4 7 11 7 11Z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

export const IconLogout = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M14 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 8 6 12l4 4" />
    <path d="M6 12h9" />
  </svg>
);

export const IconPlus = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M12 5.5v13M5.5 12h13" />
  </svg>
);

export const IconQuote = ({ size = 24 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden
    focusable="false"
  >
    <path d="M9.4 6.5c-3 1.4-4.8 3.9-4.8 7v4.4h5.7v-5.6H7.6c.2-1.6 1.1-2.8 2.7-3.6zm9 0c-3 1.4-4.8 3.9-4.8 7v4.4h5.7v-5.6h-2.7c.2-1.6 1.1-2.8 2.7-3.6z" />
  </svg>
);

export const IconInbox = ({ size = 24 }) => (
  <svg {...base(size)}>
    <path d="M4 13.5 6 5.5h12l2 8v4a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
    <path d="M4 13.5h4l1 2.5h6l1-2.5h4" />
  </svg>
);
