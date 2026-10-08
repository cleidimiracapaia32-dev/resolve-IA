from playwright.sync_api import sync_playwright
import sys

BASE = "http://localhost:4200"

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errors = []
    pg.on("pageerror", lambda e: errors.append(f"PAGEERROR: {e}"))
    pg.on("console", lambda m: errors.append(f"CONSOLE {m.type}: {m.text}") if m.type == "error" else None)

    pg.goto(f"{BASE}/entrar", wait_until="networkidle")
    pg.fill('input[type="email"]', "teste@resolveia.pt")
    pg.fill('input[type="password"]', "password123")
    pg.click('button[type="submit"]')
    try:
        pg.wait_for_url("**/app", timeout=10000)
    except Exception as e:
        print("REDIRECT FAIL:", pg.url)
    pg.wait_for_timeout(3500)

    print("URL:", pg.url)
    print("has nav:", pg.locator("nav").count() > 0)
    print("has aside/sidebar:", pg.locator("aside").count() > 0)
    html = pg.locator("#root").inner_html()
    print("root html len:", len(html))
    pg.screenshot(path="/home/user/resolve-ia/.tmp/dash.png", full_page=True)
    print("ERRORS:", errors[:5] if errors else "none")
    b.close()
