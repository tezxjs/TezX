export declare function useParams({
  path,
  urlPattern,
}: {
  path: string;
  urlPattern: string;
}): {
  success: boolean;
  params: Record<string, any>;
};
