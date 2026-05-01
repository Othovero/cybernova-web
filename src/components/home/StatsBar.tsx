const STATS = [
  { value: "50+",    label: "Government Clients" },
  { value: "10,000+", label: "Threats Neutralised" },
  { value: "99.5%",  label: "Platform Uptime" },
  { value: "<5s",    label: "AI Response Time" },
];

export function StatsBar() {
  return (
    <section className="bg-navy-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/10">
          {STATS.map((stat) => (
            <div key={stat.label} className="py-8 px-6 text-center">
              <div className="text-3xl font-bold text-nova-400 mb-1">{stat.value}</div>
              <div className="text-sm text-white/60 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
