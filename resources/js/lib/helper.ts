import { AxiosError } from "axios";

export function getErrorMessage(err: unknown): string {
    if (err instanceof AxiosError) {
        // AxiosError: try to get response message first
        return err.response?.data?.message || err.message || "Something went wrong";
    }

    if (err instanceof Error) {
        // Standard JS Error
        return err.message || "Something went wrong";
    }

    // Fallback for anything else
    return "Something went wrong";
}

export  const timeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
};


/**
 * Get first 2 alphabets from a name
 * @param {string} name
 * @returns {string}
 */
export function getFirstTwoAlpha(name = "") {
  return name
    .trim()
    .replace(/[^a-zA-Z ]/g, "") // remove non-alphabet chars
    .split(" ")
    .filter(Boolean)
    .map(word => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
