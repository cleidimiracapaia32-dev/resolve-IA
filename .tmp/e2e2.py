from playwright.sync_api import sync_playwright

BASE = "http://localhost:4200"

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(f"PAGEERROR: {e}"))
    pg.on("console", lambda m: errs.append(f"CONSOLE: {m.text}") if m.type == "error" else None)

    # sign in
    pg.goto(f"{BASE}/entrar", wait_until="networkidle")
    pg.fill('input[type="email"]', "teste@resolveia.pt")
    pg.fill('input[type="password"]', "password123")
    pg.click('button[type="submit"]')
    pg.wait_for_url("**/app", timeout=10000)
    pg.wait_for_timeout(2000)

    # ---- PRACTICE ----
    pg.goto(f"{BASE}/app/treino", wait_until="networkidle")
    pg.wait_for_timeout(2500)
    pg.screenshot(path="/home/user/resolve-ia/.tmp/practice1.png")
    # click first answer option
    opts = pg.locator("button", has_text="A").first
    # better: click option buttons inside exercise card
    buttons = pg.locator("main button").all()
    print("practice buttons:", len(buttons))
    # click an option (look for grid of options)
    opt = pg.locator("button.opt, button:has-text('1215'), main button").nth(2)
    try:
        opt.click(timeout=3000)
    except Exception:
        # fallback: click 3rd button in main
        pg.locator("main button").nth(2).click()
    pg.wait_for_timeout(2000)
    pg.screenshot(path="/home/user/resolve-ia/.tmp/practice2.png")
    print("practice after answer text:", repr(pg.locator("main").inner_text()[:400]))

    # ---- EXAM ----
    pg.goto(f"{BASE}/app/simulado", wait_until="networkidle")
    pg.wait_for_timeout(2000)
    pg.screenshot(path="/home/user/resolve-ia/.tmp/examsetup.png")
    # start button
    pg.locator("button", has_text="Começar").first.click()
    pg.wait_for_timeout(3000)
    print("exam url:", pg.url)
    pg.screenshot(path="/home/user/resolve-ia/.tmp/examrun.png")
    # answer through exam: click first option then "Seguinte" repeatedly
    for i in range(12):
        txt = pg.locator("main").inner_text()
        if "Resultado" in txt or "resultado" in txt or "Terminado" in txt:
            break
        main_btns = pg.locator("main button").all()
        if not main_btns:
            break
        # click first option-like button
        try:
            pg.locator("main button").nth(1).click(timeout=1500)
        except Exception:
            pass
        pg.wait_for_timeout(600)
        # click Seguinte/Terminar if present
        nxt = pg.locator("button", has_text="Seguinte")
        fin = pg.locator("button", has_text="Terminar")
        if nxt.count() > 0:
            nxt.first.click()
        elif fin.count() > 0:
            fin.first.click()
        pg.wait_for_timeout(900)
    pg.wait_for_timeout(1500)
    print("exam end url:", pg.url)
    pg.screenshot(path="/home/user/resolve-ia/.tmp/examreview.png", full_page=True)
    print("exam end text:", repr(pg.locator("main").inner_text()[:500]))

    print("ERRORS:", errs[:8] if errs else "none")
    b.close()
