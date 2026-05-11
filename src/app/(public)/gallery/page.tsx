import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircuitPattern } from "@/components/ui/CircuitPattern";

const EVENTS = [
  { year: "2024", type: "Workshop",    title: "Cybersecurity Fundamentals — Gaborone",       count: 12, tag: "Workshop" },
  { year: "2024", type: "Conference",  title: "SADC Cyber Resilience Summit, Johannesburg",   count: 24, tag: "Conference" },
  { year: "2024", type: "Workshop",    title: "POPIA Compliance Workshop — Windhoek",          count: 8,  tag: "Workshop" },
  { year: "2023", type: "Training",    title: "SOC Analyst Bootcamp — Gaborone",               count: 18, tag: "Training" },
  { year: "2023", type: "Conference",  title: "FinTech Security Forum — Harare",               count: 30, tag: "Conference" },
  { year: "2023", type: "Workshop",    title: "Incident Response Tabletop — Lusaka",           count: 10, tag: "Workshop" },
  { year: "2022", type: "Training",    title: "Government IT Security Training — Gaborone",    count: 22, tag: "Training" },
  { year: "2022", type: "Conference",  title: "CyberAfrica Expo — Cape Town",                  count: 40, tag: "Conference" },
];

const TAG_COLORS: Record<string, string> = {
  Workshop:   "bg-nova-100 text-nova-500",
  Conference: "bg-navy-100 text-navy-700",
  Training:   "bg-secure/10 text-secure",
};

function EventCard({ event }: { event: typeof EVENTS[number] }) {
  return (
    <div className="bg-white border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow">
      <div className="bg-gradient-to-br from-navy-900 to-navy-700 h-44 relative flex items-center justify-center overflow-hidden">
        <Image
          src="/logotransparent.png"
          alt=""
          width={200}
          height={109}
          className="absolute opacity-[0.12] object-contain select-none pointer-events-none"
        />
        <div className="relative text-center">
          <p className="text-white/40 text-xs tracking-widest uppercase mb-1">Photos</p>
          <p className="text-nova-400 font-bold text-2xl">{event.count}</p>
          <p className="text-white/40 text-xs">images</p>
        </div>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge className={`text-xs ${TAG_COLORS[event.tag]}`}>{event.tag}</Badge>
          <span className="text-xs text-text-muted">{event.year}</span>
        </div>
        <p className="text-sm font-semibold text-navy-900 leading-snug">{event.title}</p>
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const years  = Array.from(new Set(EVENTS.map((e) => e.year))).sort((a, b) => +b - +a);
  const types  = Array.from(new Set(EVENTS.map((e) => e.type)));

  return (
    <>
      <section className="relative bg-navy-900 text-white py-16 overflow-hidden">
        <CircuitPattern />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-nova-400 text-sm font-semibold tracking-widest uppercase mb-3">Our Events</p>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Gallery</h1>
          <p className="text-white/60 max-w-2xl text-lg">
            Training workshops, conferences, and security events across Southern Africa.
          </p>
        </div>
      </section>

      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="all">
            <TabsList className="mb-8 bg-white border border-border">
              <TabsTrigger value="all">All Events</TabsTrigger>
              {types.map((t) => (
                <TabsTrigger key={t} value={t}>{t}</TabsTrigger>
              ))}
            </TabsList>

            <TabsContent value="all">
              {years.map((yr) => (
                <div key={yr} className="mb-12">
                  <h2 className="text-lg font-bold text-navy-900 mb-5 flex items-center gap-3">
                    {yr}
                    <span className="h-px flex-1 bg-border" />
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {EVENTS.filter((e) => e.year === yr).map((e) => (
                      <EventCard key={e.title} event={e} />
                    ))}
                  </div>
                </div>
              ))}
            </TabsContent>

            {types.map((type) => (
              <TabsContent key={type} value={type}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {EVENTS.filter((e) => e.type === type).map((e) => (
                    <EventCard key={e.title} event={e} />
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>
    </>
  );
}
