"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { IoIosArrowForward } from "react-icons/io";

type Props = {
  content: any;
};

export default function Sidebar({ content }: Props) {
  const params = useParams();
  return (
    <div className="relative ">
      {content?.map((r: any, index: number) => {
        let path = Array.isArray(params?.path)
          ? params?.path.join("/")
          : params?.path;
        const check = (path || "").replace(/^\/+|\/+$/g, "").includes(r?.path);
        if (r.type == "folder" && r.children?.length) {
          return (
            <div className="w-full" key={r.id}>
              <input
                type="checkbox"
                defaultChecked={check}
                className="submenu"
                id={r?.path}
              />
              <label
                htmlFor={r?.path}
                onClick={() => {
                  // router.push(`/${r.path}`)
                }}
                className={`cursor-pointer font-bold w-full hover:text-primary transition-all flex justify-between items-center px-2.5 py-2`}
              >
                <span>{r.name}</span>
                <span>
                  <IoIosArrowForward />
                </span>
              </label>
              <div className="pl-1 submenu-content">
                <div className="pl-1 w-full border-l">
                  {r.children && <Sidebar content={r.children} />}
                </div>
              </div>
            </div>
          );
        }
        else {
          return (
            <Link
              key={r?.id}
              href={`/${r?.path}` || ""}
              className={`${check ? "text-primary" : "hover:text-primary "} w-full flex items-center px-2.5 py-2 rounded transition-all`}
            >
              {r?.name}
            </Link>
          );
        }
      })}
    </div>
  );
}
