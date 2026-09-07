import {
  BarChart3,
  CalendarDays,
  Car,
  ShieldCheck,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const items = [
  {
    label: "Home",
    href: "/dashboard",
    icon: BarChart3,
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    label: "Vehicles",
    href: "/dashboard/vehicles",
    icon: Car,
  },
  {
    label: "Drivers",
    href: "/dashboard/drivers",
    icon: ShieldCheck,
  },
];

export function MobileNav() {
  return (
    <nav className="fixed inset-x-3 bottom-3 z-50 rounded-2xl border border-slate-200/80 bg-white/95 p-1.5 shadow-[0_20px_60px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-4 gap-1">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === "/dashboard"}
              className={({ isActive }: { isActive: boolean }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-semibold transition ${
                  isActive
                    ? "bg-primary text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon size={18} />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
