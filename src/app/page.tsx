import { redirect } from "next/navigation";
import docs from "./docs.json";
export default async function Home() {
  const find = docs.files.find((r) => r.path);
  return redirect(`/${find?.path}`);
}
