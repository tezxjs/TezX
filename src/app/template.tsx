'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Sidebar from './Sidebar'; // adjust the import as needed
import Header from './(component)/Header';
import docs from "./docs.json";

type Props = {
    children: React.ReactNode;
};

export default function Template({ children }: Props) {
    const [open, setOpen] = useState<boolean>(true);

    // Automatically close sidebar on small screen by default
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setOpen(false);
            } else {
                setOpen(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const openCloseHandle = () => {
        if (window.innerWidth < 1024) {
            setOpen((prev) => !prev);
        }
    };

    return (
        <div className="bg-base-100 text-base-content">
            <Header openCloseHandle={openCloseHandle} />

            <div className="flex flex-col lg:grid lg:grid-cols-12 xl:flex xl:flex-row w-full max-w-7xl mx-auto">

                {/* Sidebar Wrapper */}
                <div
                    onClick={() => openCloseHandle()}
                    className={`${open ? 'flex' : 'hidden'} col-start-1 col-end-4 lg:flex h-full w-full xl:w-fit lg:h-[calc(100vh-64px)] top-0 lg:top-16 left-0 bg-black/30 fixed lg:sticky lg:bg-inherit z-50 lg:z-30`}
                >
                    {/* Sidebar Panel */}
                    <aside
                        onClick={(event) => event.stopPropagation()}
                        className="flex flex-col bg-base-100 top-16 overflow-y-auto h-full w-72 xl:w-72 py-4 px-2"
                        role="complementary"
                        aria-label="Sidebar Navigation"
                    >
                        <Sidebar content={docs.structure} />
                        <Link
                            href="/llm"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full flex items-center px-2.5 py-2 rounded text-accent font-bold text-base sm:text-lg"
                        >
                            LLM docs
                        </Link>
                    </aside>
                </div>

                {/* Main Content */}
                <div className="col-start-4 col-end-13 w-full p-4">{children}</div>
            </div>
        </div>
    );
}
