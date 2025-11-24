import { blogsSource } from '@/lib/source';
import { getMDXComponents } from '@/mdx-components';
import { createRelativeLink } from 'fumadocs-ui/mdx';
import { DocsDescription, DocsTitle } from 'fumadocs-ui/page';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

type Props = {
    params: Promise<{ slug: string[] }>
}
export async function generateMetadata(
    props: { params: Promise<{ slug: string[] }> }
): Promise<Metadata> {
    const params = await props.params;
    const page = blogsSource.getPage(params.slug);
    if (!page) notFound();
    const [name, date, icon] = page.data.title?.split("##");
    return {
        title: name,
        description: page.data.description,
        openGraph: {
            images: page.data?.icon,
        },
    };
}

export default async function BlogDetails(props: Props) {
    const params = await props.params;
    const page = blogsSource.getPage(params.slug);
    if (!page) notFound();
    if (!page) notFound();
    const [name, date, icon] = page.data.title?.split("##");
    const MDX = page.data.body;
    return (
        <main className="mx-auto max-w-5xl px-4 py-10">
            {
                !!date &&
                <span className="text-sm opacity-80 dark:text-white">
                    {date}
                </span>
            }
            <DocsTitle>{name}</DocsTitle>
            <DocsDescription>{page.data.description}</DocsDescription>
            <MDX
                components={getMDXComponents({
                    // this allows you to link to other pages with relative file paths
                    a: createRelativeLink(blogsSource, page),
                })}
            />
        </main>
    )
}

