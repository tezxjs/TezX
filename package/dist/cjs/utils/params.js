"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useParams = useParams;
function useParams({ path, urlPattern, }) {
    let params = {};
    // ১. প্রথমে, ইনপুট হিসেবে দেওয়া path এবং urlPattern এর শুরুর ও শেষের অতিরিক্ত স্ল্যাশ ("/") অপসারণ করা হয়।
    //   উদাহরণ: "/user/123/" → "user/123"
    path = path.replace(/^\/+|\/+$/g, "");
    urlPattern = urlPattern.replace(/^\/+|\/+$/g, "");
    // ২. এরপর, উভয় path ও urlPattern কে "/" দিয়ে ভাগ করে আলাদা করে সেগমেন্টে রূপান্তর করা হয়।
    //   উদাহরণ: "user/123" → ["user", "123"]
    const pathSegments = path ? path.split("/") : [];
    const patternSegments = urlPattern ? urlPattern.split("/") : [];
    const pathLength = pathSegments.length;
    const patternLength = patternSegments.length;
    // ৩. যদি path এ থাকা সেগমেন্ট সংখ্যা pattern থেকে বেশি হয় এবং pattern এ কোনও wildcard "*" না থাকে,
    //   তাহলে মিল হবে না।
    if (pathLength > patternLength && !urlPattern.includes("*")) {
        return { success: false, params: {} };
    }
    // ৪. path এর সেগমেন্টগুলো traverse করার জন্য একটি index (pathIndex) ব্যবহার করা হচ্ছে।
    let pathIndex = 0;
    // ৫. এবার pattern এর প্রতিটি সেগমেন্টের উপর লুপ চালানো হচ্ছে।
    for (let i = 0; i < patternLength; i++) {
        const patternSegment = patternSegments[i];
        // **Wildcard:** যদি patternSegment হয় "*", তাহলে বাকি সব path সেগমেন্টকে ক্যাপচার করে "wildcard" নামে রাখবে।
        if (patternSegment?.startsWith("*")) {
            // যদি "*" এর পরে আরও pattern সেগমেন্ট থাকে, তাহলে সেগুলো মিল আছে কিনা তা চেক করবে।
            const trailingPatterns = patternSegments.slice(i + 1);
            let paramName = patternSegment.length == 1 ? "*" : patternSegment?.slice(1);
            if (trailingPatterns.length > 0) {
                // expectedTrailing: "*" এর পরে যেসব literal অংশ আছে, সেগুলো একত্রিত করা।
                const expectedTrailing = trailingPatterns.join("/");
                // actualTrailing: path এর শেষের অংশ, যেটা trailingPatterns এর দৈর্ঘ্যের সমান।
                const actualTrailing = pathSegments
                    .slice(pathLength - trailingPatterns.length)
                    .join("/");
                const wildcardPath = pathSegments
                    .slice(pathIndex, pathLength - trailingPatterns.length)
                    .join("/");
                if (expectedTrailing !== actualTrailing || !wildcardPath) {
                    return { success: false, params: {} };
                }
                // "*" এর আগের সব path সেগমেন্টকে "wildcard" হিসেবে ক্যাপচার করা।
                params[paramName] = wildcardPath;
                return { success: true, params };
            }
            else {
                // যদি "*" শেষ সেগমেন্ট হয়, তাহলে অবশিষ্ট সমস্ত path সেগমেন্টকে "wildcard" হিসাবে নেয়।
                const wildcardPath = pathSegments.slice(pathIndex).join("/");
                if (!wildcardPath) {
                    return { success: false, params: {} };
                }
                params[paramName] = wildcardPath;
                return { success: true, params };
            }
        }
        // **Optional Parameter:** যদি patternSegment শুরু হয় ":" দিয়ে এবং শেষ হয় "?" দিয়ে,
        //   উদাহরণ: ":param?"।
        if (patternSegment.startsWith(":") && patternSegment.endsWith("?")) {
            // paramName: ":" এবং "?" বাদ দিয়ে নাম সংগ্রহ করা।
            const paramName = patternSegment.slice(1, -1);
            // পরবর্তী pattern সেগমেন্ট কি আছে, তা নেওয়া।
            const nextPattern = patternSegments[i + 1];
            // যদি পরবর্তী pattern সেগমেন্ট স্ট্যাটিক (লিটারাল) হয় এবং বর্তমান path সেগমেন্টের সাথে মিল খায়,
            // তাহলে optional parameter হিসাবে এখানে কোনো মান নেবেন না (null থাকবে)।
            if (nextPattern &&
                !nextPattern.startsWith(":") &&
                nextPattern !== "*" &&
                pathIndex < pathLength &&
                // !/test == /:user?/test
                // বর্তমান পথ যদি পরবর্তী প্যাটার্ন মানে স্ট্যাটিক পথ এর সাথে মাইল তাহলে
                pathSegments[pathIndex] === nextPattern) {
                params[paramName] = null;
                // Do not increment pathIndex because the current segment matches the next literal.
                continue;
            }
            // যদি উপরের কন্ডিশন না মিলে, তাহলে optional parameter এর জন্য:
            // প্রথমে, পরবর্তীতে বাকি থাকা pattern সেগমেন্ট গুলো দেখবে যে, কতটি রিকোয়ার্ড (required) সেগমেন্ট আছে।
            const remainingPatterns = patternSegments.slice(i + 1);
            const requiredCount = remainingPatterns.filter((seg) => !(seg.startsWith(":") && seg.endsWith("?"))).length;
            // path এ বাকি থাকা সেগমেন্ট সংখ্যা।
            const remainingPath = pathLength - pathIndex;
            if (remainingPath === requiredCount) {
                // যদি path এর বাকি সেগমেন্ট ঠিক requiredCount এর সমান হয়, তাহলে optional parameter এর মান null ধরা হবে।
                params[paramName] = null;
            }
            else if (pathIndex < pathLength) {
                // অন্যথায়, বর্তমান path সেগমেন্টকে optional parameter এর মান হিসেবে নেওয়া হবে এবং pathIndex বাড়ানো হবে।
                params[paramName] = pathSegments[pathIndex];
                pathIndex++;
            }
            else {
                params[paramName] = null;
            }
            continue;
        }
        // **Required Parameter:** যদি patternSegment ":" দিয়ে শুরু হয় কিন্তু "?" দিয়ে শেষ না হয়,
        //   উদাহরণ: ":param"।
        if (patternSegment.startsWith(":")) {
            const paramName = patternSegment.slice(1);
            // এখানে নিশ্চিত করা হচ্ছে যে parameter নামটি শুধুমাত্র অক্ষর, সংখ্যা ও underscore নিয়ে গঠিত।
            if (!/^[a-zA-Z0-9_]+$/.test(paramName)) {
                return { success: false, params: {} };
            }
            // যদি path এ এখনও সেগমেন্ট থাকে, তাহলে তা ক্যাপচার করা হবে।
            if (pathIndex < pathLength) {
                params[paramName] = pathSegments[pathIndex];
                pathIndex++;
            }
            else {
                // Missing a required parameter.
                // প্রয়োজনীয় প্যারামিটার নেই, তাহলে মিল হচ্ছে না।
                return { success: false, params: {} };
            }
            continue;
        }
        // **Static Segment:** যদি patternSegment কোনও dynamic বা optional indicator না থাকে,
        //   তাহলে এটি একটি literal (স্থির) অংশ। এটি অবশ্যই path এর সেগমেন্টের সাথে ঠিক মিলতে হবে।
        const pathSegment = pathSegments[pathIndex];
        if (patternSegment !== pathSegment) {
            return { success: false, params: {} };
        }
        pathIndex++;
    }
    // ৬. যদি pattern পুরোপুরি শেষ হয়ে যায় কিন্তু path এ এখনও অতিরিক্ত সেগমেন্ট থাকে,
    //   তাহলে মিল হচ্ছে না।
    if (pathIndex < pathLength) {
        return { success: false, params: {} };
    }
    // ৭. সব মিল থাকলে সফলভাবে ফলাফল ফেরত দেওয়া হবে।
    return { success: true, params };
}
