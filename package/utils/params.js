export function useParams({ path, urlPattern }) {
  let params = {};
  path = path.replace(/^\/+|\/+$/g, "");
  urlPattern = urlPattern.replace(/^\/+|\/+$/g, "");
  const pathSegments = path ? path.split("/") : [];
  const patternSegments = urlPattern ? urlPattern.split("/") : [];
  const pathLength = pathSegments.length;
  const patternLength = patternSegments.length;
  if (pathLength > patternLength && !urlPattern.includes("*")) {
    return { success: false, params: {} };
  }
  let pathIndex = 0;
  for (let i = 0; i < patternLength; i++) {
    const patternSegment = patternSegments[i];
    if (patternSegment?.startsWith("*")) {
      const trailingPatterns = patternSegments.slice(i + 1);
      let paramName =
        patternSegment.length == 1 ? "*" : patternSegment?.slice(1);
      if (trailingPatterns.length > 0) {
        const expectedTrailing = trailingPatterns.join("/");
        const actualTrailing = pathSegments
          .slice(pathLength - trailingPatterns.length)
          .join("/");
        const wildcardPath = pathSegments
          .slice(pathIndex, pathLength - trailingPatterns.length)
          .join("/");
        if (expectedTrailing !== actualTrailing || !wildcardPath) {
          return { success: false, params: {} };
        }
        params[paramName] = wildcardPath;
        return { success: true, params };
      } else {
        const wildcardPath = pathSegments.slice(pathIndex).join("/");
        if (!wildcardPath) {
          return { success: false, params: {} };
        }
        params[paramName] = wildcardPath;
        return { success: true, params };
      }
    }
    if (patternSegment.startsWith(":") && patternSegment.endsWith("?")) {
      const paramName = patternSegment.slice(1, -1);
      const nextPattern = patternSegments[i + 1];
      if (
        nextPattern &&
        !nextPattern.startsWith(":") &&
        nextPattern !== "*" &&
        pathIndex < pathLength &&
        pathSegments[pathIndex] === nextPattern
      ) {
        params[paramName] = null;
        continue;
      }
      const remainingPatterns = patternSegments.slice(i + 1);
      const requiredCount = remainingPatterns.filter(
        (seg) => !(seg.startsWith(":") && seg.endsWith("?")),
      ).length;
      const remainingPath = pathLength - pathIndex;
      if (remainingPath === requiredCount) {
        params[paramName] = null;
      } else if (pathIndex < pathLength) {
        params[paramName] = pathSegments[pathIndex];
        pathIndex++;
      } else {
        params[paramName] = null;
      }
      continue;
    }
    if (patternSegment.startsWith(":")) {
      const paramName = patternSegment.slice(1);
      if (!/^[a-zA-Z0-9_]+$/.test(paramName)) {
        return { success: false, params: {} };
      }
      if (pathIndex < pathLength) {
        params[paramName] = pathSegments[pathIndex];
        pathIndex++;
      } else {
        return { success: false, params: {} };
      }
      continue;
    }
    const pathSegment = pathSegments[pathIndex];
    if (patternSegment !== pathSegment) {
      return { success: false, params: {} };
    }
    pathIndex++;
  }
  if (pathIndex < pathLength) {
    return { success: false, params: {} };
  }
  return { success: true, params };
}
