import {
  BriefcaseBusiness,
  Car,
  Crown,
  HeartHandshake,
  Landmark,
  Plane,
  ShieldCheck,
  UserRoundCheck
} from "lucide-react";

const services = [
  { name: "Car Rentals", detail: "Self-drive and chauffeur options", icon: Car },
  { name: "VIP Transport", detail: "Executive cars with professional drivers", icon: Crown },
  { name: "Airport Transfers", detail: "Kilimanjaro Airport pickup and drop-off", icon: Plane },
  { name: "Wedding Services", detail: "Luxury cars and guest transport", icon: HeartHandshake },
  { name: "Funeral Transport", detail: "Coordinated family and guest transport", icon: Landmark },
  { name: "Corporate Transport", detail: "Monthly rentals and business travel", icon: BriefcaseBusiness }
];

export function PublicHome() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a href="/" className="block">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">KiliRide</p>
            <h1 className="text-xl font-semibold">Management System</h1>
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
              <ShieldCheck className="h-4 w-4" />
              Auth-ready platform
            </div>
            <a className="rounded-md border px-3 py-2 text-sm font-medium" href="/login">
              Staff login
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="mb-3 text-sm font-medium text-primary">Moshi, Kilimanjaro</p>
          <h2 className="max-w-3xl text-4xl font-bold leading-tight text-foreground sm:text-5xl">
            Car rental and transport operations in one web platform.
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            Built for a local company serving rentals, VIP transport, airport pickups,
            weddings, funerals, corporate travel, and Kilimanjaro tourism transport.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" href="/login">
              Open dashboard
            </a>
            <a className="rounded-md border px-4 py-2 text-sm font-medium" href="#services">
              View service direction
            </a>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4">
            <UserRoundCheck className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold">Current build stage</h3>
              <p className="text-sm text-muted-foreground">Login and protected admin shell.</p>
            </div>
          </div>
          <dl className="mt-5 grid gap-4 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Frontend</dt>
              <dd className="font-medium">React + TypeScript</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Backend</dt>
              <dd className="font-medium">NestJS</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Database</dt>
              <dd className="font-medium">PostgreSQL + Prisma</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="border-t bg-muted/30" id="services">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <h2 className="text-2xl font-semibold">Service Categories Prepared</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <article className="rounded-lg border bg-card p-4" key={service.name}>
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-3 font-semibold">{service.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{service.detail}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
