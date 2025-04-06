export type UrlRef = {
  hash: string | undefined;
  protocol: string | undefined;
  origin: string | undefined;
  username: string | undefined;
  password: string | undefined;
  hostname: string | undefined;
  port: string | undefined;
  href: string | undefined;
  query: {
    [key: string]: string;
  };
  pathname: string | undefined;
};
export declare function sanitizePathSplit(
  basePath: string,
  path: string,
): string[];
export declare function urlParse(url: string): UrlRef;
