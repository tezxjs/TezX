"use client";
import React from "react";
import { Globe, Zap, Cpu, Layers, Server, Activity } from "lucide-react";

const useCases = [
    {
        icon: <Globe size={28} className="text-[#ff581e]" />,
        title: "Global Edge APIs",
        desc: "Deploy TezX-powered endpoints at the edge to serve users worldwide with minimal latency.",
    },
    {
        icon: <Zap size={28} className="text-[#ff581e]" />,
        title: "Real-time Microservices",
        desc: "Handle thousands of concurrent requests per second, ideal for chat apps, notifications, and live feeds.",
    },
    {
        icon: <Cpu size={28} className="text-[#ff581e]" />,
        title: "High-performance Backends",
        desc: "Perfect for event-driven backends where predictable, low-latency responses are critical.",
    },
    {
        icon: <Layers size={28} className="text-[#ff581e]" />,
        title: "Composable Services",
        desc: "Easily combine routes, middleware, and static file serving into scalable, maintainable microservices.",
    },
    {
        icon: <Server size={28} className="text-[#ff581e]" />,
        title: "Streaming & Static Content",
        desc: "Serve large static files or streaming content efficiently using Bun’s native streams and optimized HTTP engine.",
    },
    {
        icon: <Activity size={28} className="text-[#ff581e]" />,
        title: "Analytics & Event Processing",
        desc: "Process high-volume events in real-time for analytics dashboards, logging, and monitoring systems.",
    },
];

export default function EdgeUseCases() {
    return (
        <section className="mx-auto py-12 space-y-8">
            {/* Section Header */}
            <div className="text-center">
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-3">
                    <Layers className="text-[#ff581e]" /> Edge & Real-world Use Cases
                </h2>
                <p className="mt-2 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                    TezX Bun Edition excels in real-world deployments — from global edge servers to microservices and high-performance APIs.
                </p>
            </div>

            {/* Use Case Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {useCases.map((useCase) => (
                    <div
                        key={useCase.title}
                        className="p-6 border rounded-xl bg-white dark:bg-white/10 shadow hover:shadow-md transition-shadow duration-300"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 rounded-md bg-[#ff581e]/10">{useCase.icon}</div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{useCase.title}</h3>
                                <p className="mt-1 text-gray-600 dark:text-gray-300 text-sm">{useCase.desc}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
