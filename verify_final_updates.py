from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:8000/index.html")
    page.wait_for_timeout(500)

    # 1. Main menu with Franz Kafka quote, login bar, rectangular stacked icons
    page.screenshot(path="/home/jules/verification/screenshots/1_main_menu_banner.png")
    page.wait_for_timeout(500)

    # 2. Go to Settings and switch language to Polish and English
    page.click("text=Nastavení")
    page.wait_for_timeout(500)
    page.select_option("#language-select", "pl")
    page.wait_for_timeout(500)
    page.screenshot(path="/home/jules/verification/screenshots/2_settings_polish.png")

    page.select_option("#language-select", "cs")
    page.wait_for_timeout(500)
    page.click("#screen-settings .back-btn")
    page.wait_for_timeout(500)

    # 3. Recommended Books screen (Farma zvířat, Obraz Doriana Graye, Malý princ)
    page.click("text=Doporučené knihy")
    page.wait_for_timeout(500)
    page.screenshot(path="/home/jules/verification/screenshots/3_doporucene_knihy.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 390, 'height': 844},
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
