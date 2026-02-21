import type { Metadata } from "next";
import Banner from "./banner";
import FurtherReading from "./FurtherReading";
import { PerformanceInsights } from "./PerformanceInsights";
import WhyItMatters from "./WhyItMatters";
import EdgeUseCases from "./EdgeUseCases";

const SITE_NAME = "TezX";

export async function generateMetadata(): Promise<Metadata> {
  const title = "TezX — Ultra-Fast Bun Framework";
  const description =
    "TezX is a modern, ultra-lightweight, and high-performance JavaScript framework built for Bun. Experience blazing-fast routing, middleware, static serving, and powerful developer ergonomics.";

  const ogImage = `/bun-benchmark-og.png`; // replace with your image

  return {
    title,
    description,
    keywords: [
      "TezX",
      "JavaScript framework",
      "Bun",
      "Bun HTTP",
      "Fast backend",
      "Node alternative",
      "Deno alternative",
      "Web framework",
    ],

    openGraph: {
      title,
      description,
      siteName: SITE_NAME,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "TezX — Ultra-Fast Bun Framework",
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    icons: {
      icon: "/favicon.ico",
      // apple: "/apple-touch-icon.png",
    },
  };
}

export default function BenchmarkPage() {

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-16">
      {/* What's TezX */}
      <Banner />
      <PerformanceInsights />
      <WhyItMatters />
      {/* <EdgeUseCases /> */}
      <FurtherReading />
    </div>
  );
}
