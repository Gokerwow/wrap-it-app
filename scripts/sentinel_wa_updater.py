#!/usr/bin/env python3
"""Sentinel updater for WhatsApp Web design tokens.

Fetches the live public WhatsApp Web stylesheet without login,
detects token divergence, and optionally patches local files.

Usage:
  python scripts/sentinel_wa_updater.py --check
  python scripts/sentinel_wa_updater.py --auto-patch
"""
import argparse
import json
import os
import re
import subprocess
import sys
import urllib.request

WA_URL = "https://web.whatsapp.com/"
UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 (KHTML, like Gecko) "
    "Chrome/126.0.0.0 Safari/537.36"
)

BROWSER_HEADERS = {
    "User-Agent": UA,
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
    "Upgrade-Insecure-Requests": "1",
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
}

CSS_HEADERS = {
    "User-Agent": UA,
    "Accept": "text/css,*/*;q=0.1",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": WA_URL,
}
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TOKENS_PATH = os.path.join(ROOT, "extension", "tokens.json")
CONTENT_PATH = os.path.join(ROOT, "extension", "content.js")
POPUP_PATH = os.path.join(ROOT, "extension", "popup.js")

WDS_RE = re.compile(r"--WDS-[A-Za-z0-9_-]+")
VAR_DEF_RE = re.compile(r"(--[A-Za-z0-9_-]+)\s*:")
LINK_RE = re.compile(r'<link[^>]+href="([^"]+\.css[^"]*)"', re.IGNORECASE)
STATIC_CSS_RE = re.compile(r"https://static\.whatsapp\.net/[^\"'\s<>]+\.css")
CSS_URL_RE = re.compile(r"https?://[^\"'\s<>]+\.css")


def fetch_text(url, timeout=30, headers=None):
    req = urllib.request.Request(url, headers=headers or BROWSER_HEADERS)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        raw = resp.read()
    return raw.decode("utf-8", errors="ignore")


def fetch_css(url, timeout=30):
    return fetch_text(url, timeout=timeout, headers=CSS_HEADERS)


def find_css_urls(html):
    urls = LINK_RE.findall(html)
    static_urls = [u for u in urls if "static.whatsapp.net" in u]
    if static_urls:
        seen = []
        for u in static_urls:
            if u not in seen:
                seen.append(u)
        return seen
    fallback = STATIC_CSS_RE.findall(html)
    if fallback:
        seen = []
        for u in fallback:
            if u not in seen:
                seen.append(u)
        return seen
    seen = []
    for u in CSS_URL_RE.findall(html):
        if u not in seen:
            seen.append(u)
    return seen


def load_local_tokens():
    with open(TOKENS_PATH, encoding="utf-8") as f:
        data = json.load(f)
    tokens = data.get("tokens", {})
    return data, tokens


def extract_default(css, name):
    m = re.search(re.escape(name) + r"\s*:\s*([^;!{}]+)", css)
    if not m:
        return ""
    val = m.group(1).strip()
    if len(val) > 120:
        val = val[:120]
    return val


def guess_group(name):
    low = name.lower()
    if "accent" in low or "brand" in low or "persistent" in low:
        return "accent"
    if "bubble" in low:
        return "bubble"
    if "composer" in low or "wallpaper" in low:
        return "composer"
    if "content" in low:
        return "content"
    if "divider" in low or "outline" in low or "lines" in low:
        return "lines"
    if "surface" in low or "wash" in low or "nav" in low or "filter" in low or "active-list" in low:
        return "surface"
    if "background" in low:
        return "background"
    return "misc"


def guess_label(name):
    core = name.replace("--WDS-", "").replace("-", " ").strip()
    if not core:
        core = name
    return core.title()


def audit(live_counter, known_tokens, css_text, css_url, css_size):
    live_set = set(live_counter.keys())
    known_set = set(known_tokens.keys())
    print("Live stylesheet: %s" % css_url)
    print("Bundle size: %d bytes" % css_size)
    print("Total live WDS tokens: %d" % len(live_set))
    print("Tracked tokens: %d" % len(known_set))
    print("")
    print("%-55s %10s %9s" % ("TOKEN", "LIVE_USES", "STATUS"))
    print("-" * 80)
    verified = 0
    deprecated = []
    for name in sorted(known_set):
        uses = live_counter.get(name, 0)
        # An RGB companion may only appear via rgba() usage, so fall back
        # to checking the raw name string in the bundle.
        if uses == 0 and name in css_text:
            uses = css_text.count(name)
        ok = uses > 0
        if ok:
            verified += 1
        else:
            deprecated.append(name)
        print("%-55s %10d %9s" % (name, uses, "live" if ok else "missing"))
    print("")
    print("Verified: %d/%d" % (verified, len(known_set) if known_set else 1))
    candidates = sorted(live_set - known_set, key=lambda n: (-live_counter.get(n, 0), n))
    if deprecated:
        print("")
        print("Possibly deprecated (%d):" % len(deprecated))
        for name in deprecated:
            print("  - %s" % name)
    else:
        print("No deprecated tokens detected.")
    if candidates:
        print("")
        print("New candidate tokens (%d, top 30):" % len(candidates))
        for name in candidates[:30]:
            print("  + %s (uses %d)" % (name, live_counter.get(name, 0)))
    else:
        print("No new candidate tokens.")
    return deprecated, candidates


def sync_rgb_pairs(new_tokens):
    with open(CONTENT_PATH, encoding="utf-8") as f:
        src = f.read()
    m = re.search(r"const RGB_PAIRS = \{(.*?)\};", src, re.DOTALL)
    if not m:
        print("RGB_PAIRS block not found, skipping sync.")
        return False
    block = m.group(1)
    existing = dict(re.findall(r"'([^']+)'\s*:\s*'([^']+)'", block))
    changed = False
    for name in new_tokens:
        if name.endswith("-RGB"):
            hex_key = name[:-4]
            if hex_key and hex_key not in existing.values() and hex_key not in existing:
                pass
            if hex_key and hex_key not in [k for k in existing.keys()]:
                # Only add if the hex parent is a known token or also new.
                existing[hex_key] = name
                changed = True
    # Also ensure every known -RGB token has a pair entry.
    try:
        _, known = load_local_tokens()
    except Exception:
        known = {}
    for name in list(known.keys()) + list(new_tokens):
        if name.endswith("-RGB"):
            hex_key = name[:-4]
            if hex_key in known or hex_key in new_tokens:
                if hex_key not in existing:
                    existing[hex_key] = name
                    changed = True
    if not changed:
        return False
    lines = ["const RGB_PAIRS = {"]
    for k in sorted(existing.keys()):
        lines.append("  '%s': '%s'," % (k, existing[k]))
    lines.append("};")
    new_block = "\n".join(lines)
    old_block = m.group(0)
    src = src.replace(old_block, new_block)
    with open(CONTENT_PATH, "w", encoding="utf-8", newline="") as f:
        f.write(src)
    print("Synced RGB_PAIRS in extension/content.js (%d pairs)." % len(existing))
    return True


def run_node_checks():
    for path in (CONTENT_PATH, POPUP_PATH):
        r = subprocess.run(["node", "--check", path], capture_output=True, text=True)
        if r.returncode != 0:
            print("node --check failed for %s:" % path)
            print(r.stderr or r.stdout)
            return False
        print("node --check ok: %s" % os.path.basename(path))
    return True


def do_check():
    try:
        html = fetch_text(WA_URL)
    except Exception as e:
        print("Failed to fetch %s: %s" % (WA_URL, e))
        return 1
    urls = find_css_urls(html)
    if not urls:
        print("No stylesheet links found on WhatsApp Web homepage.")
        return 1
    css_parts = []
    main_url = urls[0]
    total = 0
    # Cap downloads to keep the check fast.
    for u in urls[:8]:
        try:
            css = fetch_css(u)
            css_parts.append(css)
            total += len(css.encode("utf-8", errors="ignore"))
            print("Fetched %s (%d bytes)" % (u, len(css)))
        except Exception as e:
            print("Skip %s: %s" % (u, e))
    if not css_parts:
        print("Could not download any CSS bundle.")
        return 1
    bundle = "\n".join(css_parts)
    live_counter = {}
    for tok in WDS_RE.findall(bundle):
        live_counter[tok] = live_counter.get(tok, 0) + 1
    _, known = load_local_tokens()
    print("")
    deprecated, _ = audit(live_counter, known, bundle, main_url, total)
    if deprecated:
        print("")
        print("Note: missing tokens may be theme scoped or renamed. Run --auto-patch to review.")
    return 0


def do_patch():
    try:
        html = fetch_text(WA_URL)
    except Exception as e:
        print("Failed to fetch %s: %s" % (WA_URL, e))
        return 1
    urls = find_css_urls(html)
    if not urls:
        print("No stylesheet links found.")
        return 1
    css_parts = []
    for u in urls[:8]:
        try:
            css_parts.append(fetch_css(u))
        except Exception as e:
            print("Skip %s: %s" % (u, e))
    if not css_parts:
        print("Could not download any CSS bundle.")
        return 1
    bundle = "\n".join(css_parts)
    live_counter = {}
    for tok in WDS_RE.findall(bundle):
        live_counter[tok] = live_counter.get(tok, 0) + 1
    data, known = load_local_tokens()
    deprecated, candidates = audit(live_counter, known, bundle, urls[0], sum(len(c) for c in css_parts))
    # Core candidates: seen more than once to skip one off build noise.
    core_new = [n for n in candidates if live_counter.get(n, 0) >= 2]
    if not deprecated and not core_new:
        print("")
        print("Nothing to patch. Local tokens match live stylesheet.")
        return 0
    added = []
    for name in sorted(core_new):
        if name in data.get("tokens", {}):
            continue
        default = extract_default(bundle, name)
        data.setdefault("tokens", {})[name] = {
            "label": guess_label(name),
            "group": guess_group(name),
            "default": default,
        }
        added.append(name)
    if added:
        with open(TOKENS_PATH, "w", encoding="utf-8", newline="\n") as f:
            json.dump(data, f, indent=2)
            f.write("\n")
        print("")
        print("Added %d tokens to extension/tokens.json:" % len(added))
        for name in added:
            print("  + %s" % name)
    else:
        print("")
        print("No new core tokens to add.")
    sync_rgb_pairs(added)
    print("")
    if not run_node_checks():
        return 1
    print("Auto patch complete.")
    return 0


def main(argv=None):
    p = argparse.ArgumentParser(
        description="Audit live WhatsApp Web tokens and optionally patch local files. No login required.",
        epilog="Examples: python scripts/sentinel_wa_updater.py --check | python scripts/sentinel_wa_updater.py --auto-patch",
    )
    p.add_argument("--check", action="store_true", help="Audit local tokens against the live stylesheet (default).")
    p.add_argument("--auto-patch", action="store_true", help="Add new live tokens to tokens.json and sync RGB_PAIRS in content.js, then run node syntax checks.")
    args = p.parse_args(argv)
    if args.auto_patch:
        return do_patch()
    return do_check()


if __name__ == "__main__":
    sys.exit(main())
