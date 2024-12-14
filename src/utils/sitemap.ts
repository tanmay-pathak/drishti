import { xml2js } from "xml-js";
import { SitemapURL } from "../types/index.js";
import fetch from "node-fetch";

interface SitemapXML {
  urlset: {
    url: Array<{
      loc: { _text: string };
      lastmod?: { _text: string };
      priority?: { _text: string };
    }>;
  };
}

export async function parseSitemap(sitemapUrl: string): Promise<SitemapURL[]> {
  const response = await fetch(sitemapUrl);
  const xmlContent = await response.text();

  const result = xml2js(xmlContent, { compact: true }) as {
    urlset: SitemapXML["urlset"];
  };
  const urls = result.urlset.url;

  return Array.isArray(urls)
    ? urls.map((url) => ({
        loc: url.loc._text,
        lastmod: url.lastmod?._text,
        priority: url.priority?._text
          ? parseFloat(url.priority._text)
          : undefined,
      }))
    : [];
}
