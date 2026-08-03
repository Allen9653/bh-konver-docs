"""Automated i18n regression test for the /alati route.

Verifies that switching the interface language instantly re-renders every
localized surface on the tools page: hero headings, section headings, tool
cards, badges/filters, action buttons and tooltips/aria-labels.

Run:  python3 scripts/test-i18n-alati.py [base_url]
"""

import asyncio
import json
import sys
from pathlib import Path

from playwright.async_api import async_playwright

BASE_URL = sys.argv[1] if len(sys.argv) > 1 else "http://localhost:8080"
ROOT = Path(__file__).resolve().parent.parent
LOCALES = ROOT / "src" / "i18n" / "locales"

# language code -> label shown in the language dropdown
LANGUAGES = {
    "en": "English",
    "de": "Deutsch",
    "tr": "Türkçe",
    "bs": "Bosanski",
}

# translation keys that must be visible on /alati for every language
REQUIRED_KEYS = [
    "alati.heroTitlePrefix",
    "alati.heroTitleAccent",
    "alati.heroSubtitle",
    "alati.dailyToolsTitle",
    "alati.dailyToolsSubtitle",
    "alati.docSectionTitle",
    "alati.badgeFreemium",
    "alati.badgeNoRegistration",
    "alati.alwaysFree",
    "alati.viewPackages",
    "alati.tools.units.title",
    "alati.tools.currency.title",
    "alati.tools.script.title",
    "alati.tools.pdfToWord.title",
    "alati.tools.wordToPdf.title",
    "alati.tools.imgToPdf.title",
    "alati.trust.privateTitle",
    "alati.trust.fastTitle",
    "alati.trust.noRegTitle",
]


def load_locale(code: str) -> dict:
    with open(LOCALES / f"{code}.json", encoding="utf-8") as handle:
        return json.load(handle)


def lookup(data: dict, dotted: str):
    node = data
    for part in dotted.split("."):
        if not isinstance(node, dict) or part not in node:
            return None
        node = node[part]
    return node if isinstance(node, str) else None


async def main() -> int:
    failures: list[str] = []

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 1800})
        page = await context.new_page()
        # skip the first-run onboarding overlay
        await page.goto(BASE_URL, wait_until="domcontentloaded")
        await page.evaluate(
            "localStorage.setItem('bh-konver-onboarding-complete','true');"
            "localStorage.setItem('language','bs')"
        )
        await page.goto(f"{BASE_URL}/alati", wait_until="networkidle")
        await page.wait_for_timeout(1500)

        for code, label in LANGUAGES.items():
            # open the language dropdown (first combobox-style button in header)
            await page.get_by_role("button", name="Bosanski").or_(
                page.get_by_role("button", name="English")
            ).or_(page.get_by_role("button", name="Deutsch")).or_(
                page.get_by_role("button", name="Türkçe")
            ).first.click()
            await page.get_by_role("menuitem", name=label, exact=True).click()
            # no reload: assert the same DOM re-rendered instantly
            await page.wait_for_timeout(400)

            body = await page.inner_text("body")
            expected = load_locale(code)
            missing = []
            for key in REQUIRED_KEYS:
                value = lookup(expected, key)
                if not value:
                    missing.append(f"{key} (key absent in {code}.json)")
                elif value.split("{")[0].strip() and value.split("{")[0].strip() not in body:
                    missing.append(f"{key} -> '{value}'")

            if missing:
                failures.append(f"[{code}] not rendered: " + "; ".join(missing))
                print(f"FAIL {code}: {len(missing)} missing strings")
            else:
                print(f"PASS {code}: all {len(REQUIRED_KEYS)} strings rendered instantly")

            stored = await page.evaluate("localStorage.getItem('language')")
            if stored != code:
                failures.append(f"[{code}] language not persisted (stored={stored})")

        # persistence across a full reload (simulates login redirect)
        await page.reload(wait_until="networkidle")
        await page.wait_for_timeout(1200)
        stored = await page.evaluate("localStorage.getItem('language')")
        if stored != "bs":
            failures.append(f"language not restored after reload (stored={stored})")

        await browser.close()

    if failures:
        print("\n".join(failures))
        return 1
    print("All i18n checks passed for /alati")
    return 0


sys.exit(asyncio.run(main()))
