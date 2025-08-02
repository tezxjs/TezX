"use client";
import Link from 'next/link';
import React, { useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import Header from './(component)/Header';
import docs from "./docs.json";
import Sidebar from './Sidebar';

type Props = {
    children: React.ReactNode
}

export default function Template({ children }: Props) {
    const [open, setOpen] = useState<boolean>(true);
    let openCloseHandle = () => {
        setOpen(!open)
    }
    return (
        <div className="bg-base-100 text-base-content">
            <Header openCloseHandle={openCloseHandle} />
            <div className="flex flex-col md:grid md:grid-cols-12 xl:flex xl:flex-row w-full max-w-7xl mx-auto">

                <div
                    onClick={() => openCloseHandle()}
                    className={`col-start-1 col-end-5 ${open ? "fixed w-full h-full top-16 left-0 bg-black/30" : ""} md:sticky md:bg-inherit md:w-fit md:h-fit z-50 md:z-30`}
                >
                    <aside
                        onClick={(event) => event.stopPropagation()}
                        className={`flex bg-base-100 top-16 overflow-y-auto h-full w-72 md:w-full xl:w-72 flex-col justify-between`}
                    >
                        <nav className="py-4 w-full px-2">
                            <Sidebar content={docs.structure} />
                            <Link
                                href={`/llm`}
                                target="_blank"
                                className={`btn-ghost w-full flex items-center px-2.5 py-2 rounded text-secondary font-bold text-base sm:text-lg`}
                            >
                                LLM docs
                            </Link>
                        </nav>
                    </aside>
                </div>
                <div className="col-start-4 col-end-13 w-full">{children}</div>
            </div>
        </div>
    )
}