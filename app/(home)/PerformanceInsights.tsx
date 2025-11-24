import { Zap, BarChart, Cpu, Activity, Layers, Code } from "lucide-react";

export function PerformanceInsights() {
    const insights = [
        {
            icon: <Zap size={26} className="text-[#ff581e]" />,
            title: "Native Bun Speed",
            desc: "TezX is powered directly by Bun’s ultra-fast HTTP engine—delivering extreme throughput and minimal overhead.",
        },
        {
            icon: <Activity size={26} className="text-[#ff581e]" />,
            title: "Ultra-Low Latency",
            desc: "Built for real-time systems, TezX keeps average latency consistently in the single-digit millisecond range.",
        },
        {
            icon: <Layers size={26} className="text-[#ff581e]" />,
            title: "Scales Effortlessly",
            desc: "Designed to sustain heavy concurrency loads (400+ active connections) without degradation.",
        },
        {
            icon: <Cpu size={26} className="text-[#ff581e]" />,
            title: "Optimized for Modern APIs",
            desc: "Ideal for microservices, event-driven backends, and high-performance edge/API workloads.",
        },
        {
            icon: <BarChart size={26} className="text-[#ff581e]" />,
            title: "Predictable Performance",
            desc: "Stable under pressure with tight latency variance and minimal jitter across stress tests.",
        },
        {
            icon: <Code size={26} className="text-[#ff581e]" />,
            title: "Seamless Developer Experience",
            desc: "Minimal, intuitive API design makes routing, middleware, and static file handling effortless and fast to implement.",
        },
    ];

    return (
        <section className="space-y-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
                <Zap className="text-[#ff581e]" />
                Performance Insights
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {insights.map((i) => (
                    <div
                        key={i.title}
                        className="flex items-start gap-4 p-5 border rounded-xl bg-white dark:bg-white/10 shadow hover:shadow-md transition"
                    >
                        <div className="mt-1">{i.icon}</div>
                        <div>
                            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                                {i.title}
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                                {i.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
