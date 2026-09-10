import { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const IconDashboard = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="3" y="3" width="7" height="9" rx="1.5" />
    <rect x="14" y="3" width="7" height="5" rx="1.5" />
    <rect x="14" y="12" width="7" height="9" rx="1.5" />
    <rect x="3" y="16" width="7" height="5" rx="1.5" />
  </svg>
);

export const IconOrders = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 2h9l3 3v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z" />
    <path d="M9 8h6M9 12h6M9 16h3" />
  </svg>
);

export const IconShipments = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 7l9-4 9 4-9 4-9-4Z" />
    <path d="M3 7v10l9 4 9-4V7" />
    <path d="M12 11v10" />
  </svg>
);

export const IconCustomers = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="9" cy="8" r="3.25" />
    <path d="M3.5 20c0-3.5 2.5-6 5.5-6s5.5 2.5 5.5 6" />
    <circle cx="17.5" cy="8.5" r="2.5" />
    <path d="M15.5 14.3c2.3.4 4 2.4 4 5.7" />
  </svg>
);

export const IconProducts = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M21 8 12 3 3 8l9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M12 13v8" />
  </svg>
);

export const IconCourier = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="1.5" y="7" width="13" height="9" rx="1.5" />
    <path d="M14.5 10h3.3a1.5 1.5 0 0 1 1.28.72l1.92 3.1c.13.2.2.44.2.68V16h-6.7" />
    <circle cx="6" cy="18.5" r="2" />
    <circle cx="17" cy="18.5" r="2" />
  </svg>
);

export const IconWarehouse = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M3 10 12 4l9 6" />
    <path d="M5 9.5V20h14V9.5" />
    <path d="M9 20v-6h6v6" />
  </svg>
);

export const IconBell = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
);

export const IconSettings = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z" />
  </svg>
);

export const IconSun = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="12" cy="12" r="4.5" />
    <path d="M12 2v2.2M12 19.8V22M4.9 4.9l1.55 1.55M17.55 17.55l1.55 1.55M2 12h2.2M19.8 12H22M4.9 19.1l1.55-1.55M17.55 6.45l1.55-1.55" />
  </svg>
);

export const IconMoon = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M20 14.5a8.5 8.5 0 1 1-9.5-11.9 7 7 0 0 0 9.5 11.9Z" />
  </svg>
);

export const IconPackageCheck = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M21 8 12 3 3 8l9 5 9-5Z" />
    <path d="M3 8v8l9 5 9-5V8" />
    <path d="M9.5 12.5 11 14l3.5-3.5" />
  </svg>
);

export const IconTruckMoving = (props: IconProps) => (
  <svg {...base(props)}>
    <rect x="1" y="6" width="14" height="10" rx="1.5" />
    <path d="M15 10h3.6a1.5 1.5 0 0 1 1.28.72l1.62 2.6c.13.2.2.44.2.68V16H15" />
    <circle cx="6.5" cy="18.5" r="2" />
    <circle cx="17.5" cy="18.5" r="2" />
  </svg>
);

export const IconAlertTriangle = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M10.3 3.9 2.4 18a1.5 1.5 0 0 0 1.3 2.25h16.6A1.5 1.5 0 0 0 21.6 18L13.7 3.9a1.5 1.5 0 0 0-2.6 0Z" />
    <path d="M12 9.5v4M12 17h.01" />
  </svg>
);

export const IconChevronRight = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);

export const IconSearch = (props: IconProps) => (
  <svg {...base(props)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.2-3.2" />
  </svg>
);

export const IconPlus = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const IconLogout = (props: IconProps) => (
  <svg {...base(props)}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <path d="m16 17 5-5-5-5" />
    <path d="M21 12H9" />
  </svg>
);
