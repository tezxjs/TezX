
type Props = {}
import { version } from "../../package/package.json"
export default function Banner({ }: Props) {
    return (
        <section className="text-center space-y-4 py-20">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white">
                <span className="text-[#FF581E]">TezX</span> {version?.split(".")?.[0]} (Bun Edition)
            </h1>
            <p className="text-gray-700 dark:text-gray-300 max-w-3xl text-sm sm:text-base mx-auto">
                TezX is a modern, ultra-lightweight, and high-performance JavaScript framework built specifically for Bun. It provides a minimal yet powerful API, seamless environment management, and a high-concurrency HTTP engine for building fast, scalable web applications.
            </p>
            {/* CTA Buttons */}
            <div className="flex justify-center gap-4 py-10 lg:my-16">
                <a
                    href="/docs/getting-started/configuration"
                    className="px-6 py-3 rounded-xl bg-[#FF581E] text-white font-semibold hover:bg-[#e2511b] transition-all shadow"
                >
                    Get Started
                </a>

                <a
                    href="/docs"
                    className="px-6 py-3 rounded-xl border border-[#FF581E] text-[#FF581E] font-semibold hover:bg-[#FF581E]/10 transition-all shadow-sm"
                >
                    Docs
                </a>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {[
                    {
                        title: "Ultra-Fast Performance",
                        desc: "Optimized for Bun’s native HTTP engine and streams.",
                        icon: "/tezx/ultra-fast-performance.png"
                    },
                    {
                        icon: "/tezx/minimal-intuitive-api.png",
                        title: "Minimal & Intuitive API",
                        desc: "Clean and simple routing, middleware, and static file serving."
                    },
                    {
                        icon: "/tezx/flexible-middleware.png",
                        title: "Flexible Middleware",
                        desc: "Stackable, composable, and easy to manage."
                    },
                    {
                        icon: "/tezx/static-file-serving.png",
                        title: "Static File Serving",
                        desc: "Efficient streaming, automatic MIME detection, optional ETag support."
                    },
                    {
                        icon: "/tezx/dynamic-routing.png",
                        title: "Dynamic Routing",
                        desc: "Pattern-based, parameterized, and nested routes."
                    },
                    {
                        icon: "/tezx/secureby-default.png",
                        title: "Secure by Default",
                        desc: "Safe headers, CORS, caching, and other best practices baked in."
                    },
                ].map((f) => (
                    <div key={f.title} className="p-4 flex items-center border gap-4 rounded-2xl bg-white dark:bg-white/10 shadow-sm">
                        <img src={f?.icon} alt={f?.title} className="h-[128px] w-[128px] object-contain" />
                        <div className="text-left">
                            <h3 className="font-semibold text-[#FF581E] mb-1 text-base md:text-lg">{f.title}</h3>
                            <p className="text-gray-700 dark:text-gray-300 text-sm">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}