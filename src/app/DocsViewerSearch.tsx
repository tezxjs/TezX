"use client";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import {
  IoIosArrowDown,
  IoIosArrowForward,
  IoIosArrowUp,
  IoMdClose,
  IoMdReturnLeft,
} from "react-icons/io";
import docs from "./docs.json";

type DocItem = {
  id: number;
  name: string;
  content: string;
  folder?: string;
};

export default function DocsViewerSearch({
  setIsSearchOpen,
  modalRef,
}: {
  modalRef: any;
  setIsSearchOpen: any;
}) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredDocs = docs.files.filter(
    (doc: DocItem) =>
      search &&
      (doc.name.toLowerCase().includes(search.toLowerCase()) ||
        doc.content.toLowerCase().includes(search.toLowerCase())),
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  useEffect(() => {
    // document.addEventListener('keydown', handleKeyDown)
    if (listRef.current && filteredDocs.length > 0) {
      const activeItem = listRef.current.children[
        selectedIndex
      ] as HTMLLIElement;
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [filteredDocs.length, selectedIndex]);

  const router = useRouter();

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => Math.min(prev + 1, filteredDocs.length - 1));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      router.push(`/${filteredDocs[selectedIndex]?.path}`);
      setIsSearchOpen(false);
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
    }
  };

  return (
    <div className="fixed left-0 top-0 pt-20 w-full h-full bg-black bg-opacity-50 z-[400]">
      <div
        ref={modalRef}
        className="max-w-md mx-auto max-h-[80vh] overflow-auto bg-base-300 rounded-md border drop-shadow-lg"
      >
        {/* Search Bar */}
        <div className="py-2 pt-4 bg-base-300 z-50 px-4 border-b">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            className="input input-sm h-12 input-bordered w-full rounded-md focus"
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* Document List */}
        <ul
          ref={listRef}
          className="mt-2 max-h-[50vh] space-y-1 mx-4 overflow-y-auto mb-4"
        >
          {filteredDocs?.length == 0 ? (
            <p className="text-center text-error">😥No Result Found</p>
          ) : (
            filteredDocs.map((doc, index) => {
              const folderPath = doc.folder?.split("/");
              return (
                <li key={doc.id}>
                  <div
                    className={`w-full text-left px-3 te py-2 rounded-md border drop-shadow-sm flex flex-col transition-all duration-200 ${
                      index === selectedIndex
                        ? "bg-primary text-white"
                        : "hover:bg-primary hover:text-white"
                    }`}
                    onClick={() => {
                      router.push(`/${doc?.path}`);
                      setIsSearchOpen(false);
                    }}
                  >
                    <span>{doc.name}</span>
                    <p className="flex items-center text-xs">
                      {folderPath?.map((r, i) => (
                        <React.Fragment key={i}>
                          <span>{r == "." ? "" : r}</span>
                          {i !== folderPath.length - 1 && <IoIosArrowForward />}
                        </React.Fragment>
                      ))}
                    </p>
                  </div>
                </li>
              );
            })
          )}
        </ul>

        <footer className="px-4 pb-4 bg-base-300 pt-4 border-t flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <IoMdReturnLeft className="text-lg" />
            <span>Enter to Select</span>
          </div>
          <div className="flex items-center gap-2">
            <IoIosArrowUp className="text-lg" />
            <IoIosArrowDown className="text-lg" />
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-2">
            <IoMdClose className="text-lg" />
            <span>Esc to Close</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
