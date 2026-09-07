import {
  BarChart3,
  CalendarDays,
  Car,
  CircleDollarSign,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const navigation = [
  {
    label: "Home",
    href: "/dashboard",
    icon: BarChart3,
    end: true,
  },
  {
    label: "Bookings",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: UsersRound,
  },
  {
    label: "Payments",
    href: "/dashboard/payments",
    icon: CircleDollarSign,
  },
  {
    label: "Service",
    href: "/dashboard/maintenance",
    icon: Wrench,
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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-3xl grid-cols-7 gap-1">
        {navigation.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.end}
              className={({ isActive }: { isActive: boolean }) =>
                `flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[9px] font-bold transition ${
                  isActive
                    ? "bg-emerald-50 text-primary"
                    : "text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                }`
              }
            >
              <Icon size={18} />
              <span className="max-w-full truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
