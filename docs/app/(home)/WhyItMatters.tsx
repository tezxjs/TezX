import { Clock, Globe, TrendingUp, Zap } from "lucide-react";

const whyItMatters = [
    {
        icon: <Zap size={28} className="text-[#ff581e]" />,
        title: "High Throughput",
        desc: "Handles thousands of requests per second, making TezX ideal for APIs, microservices, and real-time applications.",
    },
    {
        icon: <Clock size={26} className="text-[#ff581e]" />,
        title: "Low Latency",
        desc: "Extremely fast response times improve user experience and ensure predictable behavior under load.",
    },
    {
        icon: <Globe size={26} className="text-[#ff581e]" />,
        title: "Runtime Flexibility",
        desc: "Runs seamlessly on Bun, giving you the speed of a modern runtime while remaining compatible with standard JavaScript patterns.",
    },
];


export default function WhyItMatters({ }) {
    return (
        <section className="my-12">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                <TrendingUp className="text-[#ff581e]" size={28} />
                Why This Matters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {whyItMatters.map((item, idx) => (
                    <div key={idx} className="p-6 border rounded-lg bg-white dark:bg-white/10 flex flex-col items-start gap-3 shadow hover:shadow-lg transition-shadow duration-300">
                        <div className="p-3 bg-[#ff581e]/10 rounded-full">{item.icon}</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{item.title}</h3>
                        <p className="text-gray-600 dark:text-gray-300">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}