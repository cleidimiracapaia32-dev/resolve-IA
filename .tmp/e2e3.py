from playwright.sync_api import sync_playwright

BASE = "http://localhost:4200"
SHOTS = "/home/user/resolve-ia/.tmp"

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(f"PAGEERROR: {e}"))
    pg.on("console", lambda m: errs.append(f"CONSOLE: {m.text[:200]}") if m.type == "error" else None)

    pg.goto(f"{BASE}/entrar", wait_until="networkidle")
    pg.fill('input[type="email"]', "teste@resolveia.pt")
    pg.fill('input[type="password"]', "password123")
    pg.click('button[type="submit"]')
    pg.wait_for_url("**/app", timeout=10000)
    pg.wait_for_timeout(1500)

    # upgrade to Pro via plans page (simulated billing) to avoid daily limits
    pg.goto(f"{BASE}/app/planos", wait_until="networkidle")
    pg.wait_for_timeout(1500)
    pro_btn = pg.locator("button", has_text="Pro").last
    try:
        pro_btn.click(timeout=3000)
        pg.wait_for_timeout(1500)
        print("plan after click:", pg.locator("main").inner_text()[:200].replace("\n", " "))
    except Exception as e:
        print("plan click failed:", e)

    # ---- PRACTICE ----
    pg.goto(f"{BASE}/app/treino", wait_until="networkidle")
    pg.wait_for_timeout(2500)
    pg.screenshot(path=f"{SHOTS}/p1.png")
    # option buttons are the grid buttons; find them by class pattern inside panel
    # click first option in the options grid
    grid_btns = pg.locator(".grid.max-w-2xl button")
    print("option buttons:", grid_btns.count())
    grid_btns.first.click()
    pg.wait_for_timeout(2000)
    pg.screenshot(path=f"{SHOTS}/p2.png")
    t = pg.locator("main").inner_text()
    print("feedback visible:", ("Correta" in t) or ("Errada" in t), "| explicação:", "Porquê" in t or "regra" in t.lower() or "Regra" in t)

    # next exercise
    nxt = pg.locator("button", has_text="Próximo")
    if nxt.count() > 0:
        nxt.first.click()
        pg.wait_for_timeout(2000)
        pg.screenshot(path=f"{SHOTS}/p3.png")
        print("next exercise loaded")

    # ---- EXAM ----
    pg.goto(f"{BASE}/app/simulado", wait_until="networkidle")
    pg.wait_for_timeout(2000)
    pg.locator("button", has_text="Começar").first.click()
    pg.wait_for_timeout(3000)
    print("exam url:", pg.url)
    pg.screenshot(path=f"{SHOTS}/e1.png")
    for i in range(15):
        if "/app/simulado/" not in pg.url:
            break
        t = pg.locator("main").inner_text()
        if "RESULTADO" in t.upper():
            break
        gb = pg.locator(".grid.max-w-2xl button")
        if gb.count() > 0:
            gb.first.click()
            pg.wait_for_timeout(500)
        nxt = pg.locator("button", has_text="Seguinte")
        fin = pg.locator("button", has_text="Terminar")
        if nxt.count() > 0:
            nxt.first.click()
        elif fin.count() > 0:
            fin.first.click()
            break
        pg.wait_for_timeout(800)
    pg.wait_for_timeout(2500)
    print("after finish url:", pg.url)
    t = pg.locator("main").inner_text()
    print("review visible:", "RESULTADO" in t.upper())
    pg.screenshot(path=f"{SHOTS}/e2.png", full_page=True)
    print("ERRORS:", errs[:8] if errs else "none")
    b.close()
