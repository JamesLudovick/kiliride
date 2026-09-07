import {
  BarChart3,
  CalendarDays,
  CalendarRange,
  Car,
  CircleDollarSign,
  LogOut,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { logout } from "../../lib/api";
import { clearAuthSession, getStoredUser } from "../../lib/auth";

const mainNavigation = [
  {
    label: "Dashboard",
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

const managementNavigation = [
  {
    label: "Customers",
    href: "/dashboard/customers",
    icon: UsersRound,
  },
];

const comingSoon = [
  {
    label: "Calendar",
    icon: CalendarRange,
  },
  {
    label: "Payments",
    icon: CircleDollarSign,
  },
  {
    label: "Maintenance",
    icon: Wrench,
  },
];

export function Sidebar() {
  const navigate = useNavigate();
  const user = getStoredUser();

  async function handleLogout() {
    try {
      await logout();
    } catch {
      // Local session is still cleared if API logout fails.
    } finally {
      clearAuthSession();
      navigate("/login", { replace: true });
    }
  }

  return (
    <aside className="kr-sidebar hidden min-h-screen w-[280px] shrink-0 flex-col lg:flex">
      <div className="border-b border-white/10 px-6 py-6">
        <NavLink to="/" className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary font-black text-[#102c27] shadow-lg">
            KR
          </div>

          <div>
            <div className="text-lg font-black tracking-[0.18em] text-white">
              KILIRIDE
            </div>

            <div className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-100/60">
              Operations
            </div>
          </div>
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mb-8">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/40">
            Workspace
          </div>

          <nav className="space-y-1.5">
            {mainNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  end={item.href === "/dashboard"}
                  className={({ isActive }: { isActive: boolean }) =>
                    `kr-sidebar-item ${
                      isActive ? "kr-sidebar-item-active" : ""
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        <div>
          <div className="mb-3 px-3">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-100/40">
              Management
            </span>
          </div>

          <nav className="space-y-1.5">
            {managementNavigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }: { isActive: boolean }) =>
                    `kr-sidebar-item ${
                      isActive ? "kr-sidebar-item-active" : ""
                    }`
                  }
                >
                  <Icon size={18} strokeWidth={2} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}

            {comingSoon.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.label}
                  className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-emerald-50/35"
                >
                  <Icon size={18} />

                  <span>{item.label}</span>

                  <span className="ml-auto rounded-full bg-white/[0.07] px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-emerald-50/35">
                    Soon
                  </span>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 rounded-2xl bg-white/[0.06] p-3.5">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/10 text-sm font-bold text-white">
              {(user?.name ?? "K")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="min-w-0">
              <div className="truncate text-sm font-semibold text-white">
                {user?.name ?? "KiliRide user"}
              </div>

              <div className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-emerald-100/45">
                {user?.role ?? "Staff"}
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-emerald-50/65 transition hover:bg-red-500/10 hover:text-red-200"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
