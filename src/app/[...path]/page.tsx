import { SiteDescription, SiteTitle } from "@/config";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import docs from "../docs.json";
import MarkdownRenderer from "./MarkdownRenderer";
type Props = {
  params: { path: any };
};
export async function generateMetadata({
  params,
}: {
  params: { path: string[] };
}): Promise<Metadata> {
  const path = Array.isArray(params?.path)
    ? params.path?.join("/")
    : params?.path;
  const dx = docs.files.find((r) => r.path === path);

  if (!dx) {
    return { title: `Page Not Found | Docs | ${SiteTitle}` };
  }

  return {
    title: `${dx.name} | Documentation | ${SiteTitle}`,
    description: `${SiteDescription}. Read the documentation for ${dx.name}. Learn about ${dx.name} in detail.`,
    openGraph: {
      title: `${dx.name} | Documentation`,
      description: `${SiteDescription}. Explore the ${dx.name} documentation page.`,
      url: `/${dx.path}`,
      type: "article",
    },
  };
}

export default function page({ params }: Props) {
  const path = Array.isArray(params?.path)
    ? params.path?.join("/")
    : params?.path;
  const dx = docs.files.find((r) => r.path == path);
  if (dx) {
    const next = docs.files.find((r) => r.id == dx.id + 1);
    const prev = docs.files.find((r) => r.id == dx.id - 1);

    return (
      <section className="p-4">
        <MarkdownRenderer markdown={dx.content} />
        <div className="flex items-center justify-center pt-5 pb-4 gap-4">
          {prev?.path && (
            <Link
              className="btn btn-outline hover:border-primary rounded-md btn-sm h-10 capitalize hover:bg-primary hover:text-white"
              href={`/${prev.path}`}
            >
              <span>
                <IoIosArrowBack />
              </span>
              <span>{prev?.name}</span>
            </Link>
          )}

          {next?.path && (
            <Link
              className="btn btn-outline hover:border-primary rounded-md btn-sm h-10 capitalize hover:bg-primary hover:text-white"
              href={`/${next.path}`}
            >
              <span>{next?.name}</span>
              <span>
                <IoIosArrowForward />
              </span>
            </Link>
          )}
        </div>
      </section>
    );
  }
  return notFound();
}

export function generateStaticParams(props: { params: { path: any } }) {
  return docs?.files
    ?.filter((r) => r.path)
    .map((r) => {
      return {
        path: r?.path?.split("/"),
      };
    });
}
