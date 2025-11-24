import { blogsSource } from "@/lib/source";
import { Clock } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

type Props = {};

export async function generateMetadata(): Promise<Metadata> {
    const src = blogsSource.pageTree;
    const blogs: any[] = src?.children || [];

    const latestBlog = blogs[0];

    const title = "The latest TezX news";
    const description = latestBlog?.description || "Read the latest news and updates about TezX.";

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            type: "website",
            url: "/blogs",
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}

export default function Page({ }: Props) {
    const src = blogsSource.pageTree;
    const blogs: any[] = src?.children || [];
    return (
        <main className="mx-auto max-w-7xl px-4 py-10">
            {/* Page Header */}
            <h3 className="text-3xl font-semibold leading-10 tracking-tighter text-gray-900 dark:text-white mb-8">
                The latest TezX news
            </h3>

            {/* Blog Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {blogsSource.pageTree?.children?.map((blog: any) => {
                    const [name, date, icon] = blog?.name?.split("##");
                    const iconUrl = typeof blog.icon === "string" ? blog.icon : undefined;
                    return <Link
                        key={blog.$id}
                        href={blog.url}
                        className="group block border rounded-xl overflow-hidden shadow hover:scale-[101%] transition-all duration-300 min-w-[300px]"
                    >
                        {/* Thumbnail */}
                        {
                            icon &&
                            <div className="relative overflow-hidden h-56 w-full">
                                <img
                                    src={icon}
                                    alt={name}
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {/* ) : (
                                    <div className="flex items-center justify-center h-full bg-gray-100 dark:bg-gray-700 text-gray-400 text-4xl font-bold">
                                        {name[0]}
                                    </div>
                                ) */}
                            </div>
                        }

                        {/* Blog Info */}
                        <div className="p-4">
                            {
                                !!date &&
                                <p className="text-sm opacity-80 dark:text-white flex items-center gap-1">
                                    <Clock size={14} />  {date}
                                </p>
                            }
                            <h4 className="text-lg font-semibold text-black dark:text-white mb-2 group-hover:text-[#FF581E] transition-colors duration-200">
                                {name}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">
                                {blog.description}
                            </p>
                        </div>
                    </Link>
                })}
            </div>
        </main>
    );
}
