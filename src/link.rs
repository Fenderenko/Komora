//! Links that are not GitHub repositories (sites, videos, products, articles): title, description,
//! icon, preview image and — for products — the price, from the page itself (YouTube and Vimeo through
//! their oEmbed). Icons and previews are cached in www/icons for the window.

use crate::{net, util};

#[derive(Default)]
pub struct Page {
    pub title: String,
    pub desc: String,
    pub icon: String,
    /// preview image URL
    pub image: String,
    /// "video", "product" or "page"
    pub kind: String,
    /// channel / author
    pub author: String,
    pub site: String,
    pub price: f64,
    pub currency: String,
}

/// A price as the page writes it: "1 199,00", "1199.5", "₴1,199".
fn num(s: &str) -> Option<f64> {
    let t: String = s.chars().filter(|c| c.is_ascii_digit() || *c == '.' || *c == ',').collect();
    // "1,199.00" → thousands comma; "1199,50" → decimal comma
    let t = if t.contains('.') && t.contains(',') { t.replace(',', "") } else if t.matches(',').count() == 1 && t.rsplit(',').next().is_some_and(|d| d.len() <= 2) { t.replace(',', ".") } else { t.replace(',', "") };
    t.parse::<f64>().ok().filter(|v| *v > 0.0 && v.is_finite())
}

/// The price in JSON-LD ("price": "1199" / 1199) and its currency.
fn ld_price(html: &str) -> Option<(f64, String)> {
    let mut from = 0;
    while let Some(i) = html[from..].find("\"price\"") {
        let at = from + i + 7;
        from = at;
        let rest = html[at..].trim_start();
        let Some(rest) = rest.strip_prefix(':') else { continue };
        let rest = rest.trim_start().trim_start_matches('"');
        let end = rest.find(|c: char| !(c.is_ascii_digit() || c == '.' || c == ',' || c == ' ')).unwrap_or(rest.len());
        if let Some(v) = num(&rest[..end]) {
            let cur = html.find("\"priceCurrency\"").and_then(|j| {
                let r = html[j + 15..].trim_start().strip_prefix(':')?.trim_start().strip_prefix('"')?;
                Some(r[..r.find('"')?].to_string())
            });
            return Some((v, cur.unwrap_or_default()));
        }
    }
    None
}

/// The currency of a shop that does not state it in its data: by the country of the domain, else by
/// a currency sign on the page ("$" is too common in scripts to count); "" — unknown.
fn guess_currency(url: &str, html: &str) -> &'static str {
    let host = net::split_url(url).map(|h| h.0).unwrap_or_default();
    let tld = host.rsplit('.').next().unwrap_or_default();
    let by_tld = match tld {
        "ua" => "UAH",
        "pl" => "PLN",
        "uk" if host.ends_with(".co.uk") || host.ends_with(".org.uk") => "GBP",
        "de" | "fr" | "it" | "es" | "nl" | "at" | "be" | "fi" | "ie" | "pt" | "sk" | "si" | "lt" | "lv" | "ee" | "gr" | "eu" => "EUR",
        "cz" => "CZK",
        _ => "",
    };
    if !by_tld.is_empty() {
        return by_tld;
    }
    if html.contains('₴') || html.contains("грн") {
        "UAH"
    } else if html.contains("zł") {
        "PLN"
    } else if html.contains('€') {
        "EUR"
    } else if html.contains('£') {
        "GBP"
    } else {
        ""
    }
}

/// YouTube or Vimeo: their oEmbed endpoint for this link.
fn oembed(url: &str) -> Option<String> {
    let host = net::split_url(url)?.0;
    let h = host.trim_start_matches("www.").trim_start_matches("m.").trim_start_matches("music.");
    match h {
        "youtube.com" | "youtu.be" => Some(format!("https://www.youtube.com/oembed?format=json&url={}", net::enc(url))),
        "vimeo.com" => Some(format!("https://vimeo.com/api/oembed.json?url={}", net::enc(url))),
        _ => None,
    }
}

/// The value of attribute `name` in one tag ("<meta property=og:title content=…>").
fn attr(tag: &str, name: &str) -> Option<String> {
    let low = tag.to_ascii_lowercase();
    let mut from = 0;
    while let Some(i) = low[from..].find(name) {
        let at = from + i;
        from = at + name.len();
        let before = low[..at].chars().last().unwrap_or(' ');
        let rest = low[from..].trim_start();
        if !before.is_whitespace() || !rest.starts_with('=') {
            continue;
        }
        let vstart = tag.len() - rest.len() + 1;
        let v = tag[vstart..].trim_start();
        let (q, body) = match v.chars().next()? {
            c @ ('"' | '\'') => (Some(c), &v[1..]),
            _ => (None, v),
        };
        let end = match q {
            Some(c) => body.find(c)?,
            None => body.find(|c: char| c.is_whitespace() || c == '>').unwrap_or(body.len()),
        };
        return Some(decode(&body[..end]));
    }
    None
}

fn decode(s: &str) -> String {
    s.replace("&amp;", "&").replace("&quot;", "\"").replace("&#39;", "'").replace("&lt;", "<").replace("&gt;", ">").replace("&#x27;", "'").trim().to_string()
}

/// Tags with this name ("meta", "link") in the head of the page.
fn tags<'a>(html: &'a str, name: &str) -> Vec<&'a str> {
    let low = html.to_ascii_lowercase();
    let open = format!("<{name}");
    let mut out = Vec::new();
    let mut from = 0;
    while let Some(i) = low[from..].find(&open) {
        let s = from + i;
        let Some(e) = low[s..].find('>') else { break };
        out.push(&html[s..s + e + 1]);
        from = s + e + 1;
    }
    out
}

/// Resolves a link of the page against its URL.
pub fn absolute(base: &str, href: &str) -> String {
    let href = href.trim();
    if href.starts_with("https://") || href.starts_with("http://") {
        return href.to_string();
    }
    let Some((host, path, _)) = net::split_url(base) else { return String::new() };
    if let Some(r) = href.strip_prefix("//") {
        return format!("https://{r}");
    }
    if href.starts_with('/') {
        return format!("https://{host}{href}");
    }
    let dir = path.split('?').next().unwrap_or("/");
    let dir = &dir[..dir.rfind('/').map_or(0, |i| i + 1)];
    format!("https://{host}{}{href}", if dir.is_empty() { "/" } else { dir })
}

pub fn parse(url: &str, html: &str) -> Page {
    let mut p = Page::default();
    let low = html.to_ascii_lowercase();
    if let (Some(a), Some(b)) = (low.find("<title"), low.find("</title>")) {
        if let Some(gt) = low[a..].find('>')
            && a + gt + 1 <= b
        {
            p.title = decode(&html[a + gt + 1..b]);
        }
    }
    for t in tags(html, "meta") {
        let key = attr(t, "property").or_else(|| attr(t, "name")).unwrap_or_default().to_ascii_lowercase();
        let val = attr(t, "content").unwrap_or_default();
        match key.as_str() {
            "og:title" if !val.is_empty() => p.title = val.clone(),
            "og:description" | "description" if p.desc.is_empty() || key == "og:description" => p.desc = val.clone(),
            "og:image" | "og:image:url" | "twitter:image" if p.image.is_empty() && !val.is_empty() => p.image = absolute(url, &val),
            "og:site_name" => p.site = val.clone(),
            "og:type" if val.starts_with("video") => p.kind = "video".into(),
            "og:type" if val.contains("product") => p.kind = "product".into(),
            "product:price:amount" | "og:price:amount" => {
                if let Some(v) = num(&val) {
                    p.price = v;
                }
            }
            "product:price:currency" | "og:price:currency" => p.currency = val.clone(),
            "author" if p.author.is_empty() => p.author = val.clone(),
            _ => {}
        }
        if p.price == 0.0
            && attr(t, "itemprop").is_some_and(|i| i == "price")
            && let Some(v) = num(&val)
        {
            p.price = v;
        }
        if p.currency.is_empty() && attr(t, "itemprop").is_some_and(|i| i.eq_ignore_ascii_case("pricecurrency")) && !val.is_empty() {
            p.currency = val.clone();
        }
    }
    if p.price == 0.0
        && let Some((v, c)) = ld_price(html)
    {
        p.price = v;
        if p.currency.is_empty() {
            p.currency = c;
        }
    }
    if p.price > 0.0 {
        p.kind = "product".into();
        if p.currency.is_empty() {
            p.currency = guess_currency(url, html).to_string();
        }
    }
    if p.kind.is_empty() {
        p.kind = "page".into();
    }
    let mut best = (0u32, String::new());
    for t in tags(html, "link") {
        let rel = attr(t, "rel").unwrap_or_default().to_ascii_lowercase();
        let Some(href) = attr(t, "href") else { continue };
        let rank = if rel.contains("apple-touch-icon") { 3 } else if rel.split_whitespace().any(|r| r == "icon") { 2 } else { 0 };
        if rank > best.0 {
            best = (rank, href);
        }
    }
    p.icon = if best.1.is_empty() { absolute(url, "/favicon.ico") } else { absolute(url, &best.1) };
    p
}

/// (worker thread; blocks) What a link is: title, description, icon, preview, price.
pub fn fetch(url: &str) -> Result<Page, String> {
    if let Some(oe) = oembed(url)
        && let Ok(r) = net::get(&oe, &[("Accept", "application/json")], 256 << 10)
        && r.status == 200
        && let Ok(v) = serde_json::from_slice::<serde_json::Value>(&r.body)
    {
        let s = |k: &str| v.get(k).and_then(|x| x.as_str()).unwrap_or_default().to_string();
        let host = net::split_url(url).map(|h| h.0).unwrap_or_default();
        let favicon = if host.contains("vimeo") { "https://vimeo.com/favicon.ico" } else { "https://www.youtube.com/favicon.ico" };
        return Ok(Page { title: s("title"), desc: String::new(), icon: favicon.into(), image: s("thumbnail_url"), kind: "video".into(), author: s("author_name"), site: s("provider_name"), price: 0.0, currency: String::new() });
    }
    let r = net::get(url, &[("Accept", "text/html"), ("Accept-Language", "uk,en;q=0.8")], 3 << 20).or_else(|e| if e == "answer too large" { Err("page too large".into()) } else { Err(e) })?;
    if r.status != 200 {
        return Err(format!("the site answered HTTP {}", r.status));
    }
    Ok(parse(url, &String::from_utf8_lossy(&r.body)))
}

/// File extension by the content (the virtual host gives the MIME type by extension).
fn image_ext(b: &[u8]) -> Option<&'static str> {
    if b.starts_with(b"\x89PNG") {
        Some("png")
    } else if b.starts_with(&[0xFF, 0xD8]) {
        Some("jpg")
    } else if b.starts_with(&[0, 0, 1, 0]) {
        Some("ico")
    } else if b.starts_with(b"GIF8") {
        Some("gif")
    } else if b.len() > 12 && &b[0..4] == b"RIFF" && &b[8..12] == b"WEBP" {
        Some("webp")
    } else {
        let head = String::from_utf8_lossy(&b[..b.len().min(512)]).to_ascii_lowercase();
        head.contains("<svg").then_some("svg")
    }
}

/// (worker thread; blocks) Downloads an icon into www/icons as `<stem>.<ext>`; the file name.
pub fn cache_icon(url: &str, stem: &str) -> Option<String> {
    let r = net::get(url, &[("Accept", "image/*")], 4 << 20).ok().filter(|r| r.status == 200)?;
    let ext = image_ext(&r.body)?;
    let name = format!("{}.{ext}", util::safe_name(stem).replace([' ', '.'], "_"));
    std::fs::write(util::www_dir().join("icons").join(&name), &r.body).ok()?;
    Some(name)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn page_meta() {
        let html = r#"<html><head><title>Site &amp; Co</title>
<meta name="description" content="Plain">
<meta property='og:description' content='From OG'>
<link rel="icon" href="/img/fav.png"><link rel="stylesheet" href="x.css"></head></html>"#;
        let p = parse("https://ex.com/a/b", html);
        assert_eq!(p.title, "Site & Co");
        assert_eq!(p.desc, "From OG");
        assert_eq!(p.icon, "https://ex.com/img/fav.png");
        assert_eq!(parse("https://ex.com", "<title>x</title>").icon, "https://ex.com/favicon.ico");
    }

    #[test]
    fn products_and_videos() {
        let html = r#"<head><meta property="og:type" content="product"><meta property="og:image" content="/img/p.jpg">
<meta property="product:price:amount" content="1 199,00"><meta property="product:price:currency" content="UAH"></head>"#;
        let p = parse("https://shop.ua/item/1", html);
        assert_eq!((p.kind.as_str(), p.price, p.currency.as_str(), p.image.as_str()), ("product", 1199.0, "UAH", "https://shop.ua/img/p.jpg"));
        let ld = r#"<script type="application/ld+json">{"@type":"Product","offers":{"@type":"Offer","priceCurrency":"UAH","price":"549.50"}}</script>"#;
        let p = parse("https://shop.ua/x", ld);
        assert_eq!((p.price, p.currency.as_str()), (549.5, "UAH"));
        let bare = r#"<meta property="product:price:amount" content="549">"#;
        assert_eq!(parse("https://rozetka.com.ua/x", bare).currency, "UAH", "by the domain");
        assert_eq!(parse("https://shop.example.com/x", &format!("{bare}<span>549 грн</span>")).currency, "UAH", "by the sign");
        assert_eq!(parse("https://shop.example.com/x", bare).currency, "", "unknown stays empty");
        let ip = r#"<meta itemprop="price" content="10"><meta itemprop="priceCurrency" content="EUR">"#;
        assert_eq!(parse("https://x.com/a", ip).currency, "EUR");
        assert_eq!(num("$1,299.99"), Some(1299.99));
        assert_eq!(num("1.299"), Some(1.299));
        assert!(oembed("https://www.youtube.com/watch?v=abc").unwrap().starts_with("https://www.youtube.com/oembed"));
        assert!(oembed("https://youtu.be/abc").is_some());
        assert!(oembed("https://example.com").is_none());
        assert_eq!(parse("https://a.b", "<title>t</title>").kind, "page");
    }

    #[test]
    fn links() {
        assert_eq!(absolute("https://ex.com/a/b.html", "c.png"), "https://ex.com/a/c.png");
        assert_eq!(absolute("https://ex.com/a/", "//cdn.x/y"), "https://cdn.x/y");
        assert_eq!(absolute("https://ex.com", "z.ico"), "https://ex.com/z.ico");
    }

    #[test]
    fn images() {
        assert_eq!(image_ext(b"\x89PNG...."), Some("png"));
        assert_eq!(image_ext(b"<?xml?><svg/>"), Some("svg"));
        assert_eq!(image_ext(b"<html>"), None);
    }
}
