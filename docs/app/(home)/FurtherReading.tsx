"use client";
import { ExternalLink, Link } from "lucide-react"; // Icon for external links

const resources = [
    { label: "Bun Official Website", url: "https://bun.sh" },
    { label: "TezX Blog", url: "/blogs" },
    { label: "TezX Docs", url: "/docs" },
    { label: "Node.js Official Website", url: "https://nodejs.org" },
    { label: "wrk Benchmark Tool", url: "https://github.com/wg/wrk" },
];

export default function FurtherReading() {
    return (
        <section className="py-12">
            <h2 className="text-2xl font-semibold flex items-center gap-2 mb-6">
                <Link /> Further Reading & Resources
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    resources.map((res) => (
                        <a
                            key={res.label}
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center justify-between p-5 border rounded-xl bg-white dark:bg-white/10 shadow hover:shadow-md transition-shadow duration-300 hover:scale-[102%]"
                        >
                            <span className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-[#ff581e]">
                                {res.label}
                            </span>
                            <ExternalLink className="text-gray-400 group-hover:text-[#ff581e] w-5 h-5 transition-colors duration-300" />
                        </a>
                    ))
                }
            </div>
            <p className="mt-6 text-gray-600 dark:text-gray-300 text-sm">
                Explore official documentation, runtime references, and benchmarking tools to get the most out of TezX and Bun.
            </p>
        </section>
    );
}
