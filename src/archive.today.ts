import { request } from "obsidian";

const siteUrl = "https://archive.ph";

const tokenRegex = /<input\s+[^>]*name="submitid"[^>]*value="([^"]*)"/;
const shortUrlRegex = /var shortlink = "http:\/\/(.+)";/;
const wipRegex =
  /document\.location\.replace\("(https:\/\/archive.ph\/wip\/.+)"\)/i;

export async function saveWebpage(url: string): Promise<string | null> {
  try {
    const pageResponse = await request({
      url: siteUrl,
      method: "get",
    });

    const match = pageResponse?.match(tokenRegex);
    const token = match ? match[1] : null;
    if (!token) {
      console.log(pageResponse);
      throw new Error("Token not found");
    }
    const queryParam = new URLSearchParams();
    queryParam.append("url", url);
    queryParam.append("submitid", token);
    const qurryString = queryParam.toString();
    const targetUrl = `${siteUrl}/submit/?${qurryString}`;
    const response = await request({
      url: targetUrl,
      method: "get",
    });
    const alreadyMatch = response.match(shortUrlRegex);
    if (alreadyMatch) {
      return `https://${alreadyMatch[1]}`;
    }
    const wipMatch = response.match(wipRegex);
    if (wipMatch) {
      return `${wipMatch[1]}`;
    }
    console.log(response);
    throw new Error("Failed to archive");
  } catch (error) {
    console.error("Error get archive:", error);
    return null;
  }
}

