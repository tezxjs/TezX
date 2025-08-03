/* eslint-disable @next/next/no-img-element */
"use client";
import { SiteTitle } from "@/config";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CgMenuRightAlt } from "react-icons/cg";
import { FaGithub } from "react-icons/fa";
import { IoMdSearch } from "react-icons/io";
import { version } from "../../../package/package.json";
import DocsViewerSearch from "../DocsViewerSearch";
type Props = {
  openCloseHandle: any
};

export default function Header({ openCloseHandle }: Props) {
  const [theme, setTheme] = useState<"dark" | "light">("light");
  // const params: ParamsType = useParams();
  // const { content, name, type } = params;
  // // Function to set the theme in both state and localStorage
  const setThemeHandle = (mode: "light" | "dark") => {
    const html = document.getElementsByTagName("html");
    html[0].setAttribute("data-theme", mode); // Update the theme attribute on the HTML element
    localStorage.setItem("theme", mode); // Save theme preference to localStorage
    setTheme(mode); // Update React state
  };

  // // Effect to load the theme from localStorage on initial render
  // useEffect(() => {
  //     const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
  //     if (savedTheme) {
  //         setThemeHandle(savedTheme); // Apply the saved theme
  //     }
  //     else {
  //         // Optional: Automatically detect the user's OS preference
  //         const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  //         setThemeHandle(prefersDark ? 'dark' : 'light');
  //     }
  // }, []); // Empty dependency array ensures this runs only once

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
        // setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === "Escape") {
        e.preventDefault();
        setIsSearchOpen(false);
        // setTimeout(() => inputRef.current?.focus(), 100);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isSearchOpen &&
        modalRef.current &&
        !modalRef.current.contains(e.target as Node) &&
        !searchRef?.current?.contains(e.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [isSearchOpen]);

  // const info = documentation?.[type]?.find(r => r?.name == name);
  return (
    <header className="bg-base-100 border-b sticky top-0 h-16 z-50 p-4">
      <header className="flex items-center justify-between w-full max-w-7xl mx-auto h-full">
        <div className="flex items-center gap-2">
          <Link href="/">
            <img src="/favicon.ico" className="h-8" alt={SiteTitle} />
          </Link>
          <h1 className="text-xl font-bold flex flex-col">
            <span>{SiteTitle}</span>
            <span className="text-xs text-primary font-extrabold">
              v{version}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-4 whitespace-nowrap">
          <div
            ref={searchRef}
            className="sm:border gap-2 px-0 sm:px-4 items-center flex input-bordered h-11 hover:bg-base-200 rounded-md pr-0 sm:pr-1 cursor-pointer"
            onClick={() => setIsSearchOpen(true)}
          >
            <p className="hidden sm:block xl:text-base text-sm">Search (Ctrl+k)</p>
            <button className="flex items-center justify-center text-2xl rounded-md transition-all">
              <IoMdSearch />
            </button>
          </div>
          <Link href={"https://github.com/srakib17/TezX"} className="text-xl">
            <FaGithub />
          </Link>
          <label className="swap swap-rotate">
            {/* this hidden checkbox controls the state */}
            <input type="checkbox" checked={theme == "dark"} />
            {/* sun icon */}
            <svg
              onClick={() => setThemeHandle("dark")}
              className="swap-on h-6 w-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41ZM12,6.5A5.5,5.5,0,1,0,17.5,12,5.51,5.51,0,0,0,12,6.5Zm0,9A3.5,3.5,0,1,1,15.5,12,3.5,3.5,0,0,1,12,15.5Z" />
            </svg>
            {/* moon icon */}
            <svg
              onClick={() => setThemeHandle("light")}
              className="swap-off  h-6 w-6 fill-current"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
            </svg>
          </label>

          <label
            onClick={() => openCloseHandle()}
            className="cursor-pointer h-14 border-b flex items-center w-full bg-base-100 bg-opacity-80 lg:hidden z-50"
          >
            <CgMenuRightAlt size={28} />
          </label>
        </div>
      </header>
      {isSearchOpen && (
        <DocsViewerSearch
          modalRef={modalRef}
          setIsSearchOpen={setIsSearchOpen}
        />
      )}
    </header>
  );
}
