import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Open local file directly
    filepath = "file://" + os.path.abspath("index.html")
    page.goto(filepath)
    page.wait_for_timeout(1000)

    # 1. Take screenshot of Main Menu with Bookshelf Logo and Quote Banner
    page.screenshot(path="/home/jules/verification/screenshots/1_main_menu_new.png")

    # 2. Cycle Quote
    page.click(".intro-banner-card")
    page.wait_for_timeout(500)
    page.screenshot(path="/home/jules/verification/screenshots/2_cycled_quote.png")

    # 3. Navigate to Moje Knihovna (where sample books can be added/viewed)
    page.click("button:has-text('Moje Knihovna')")
    page.wait_for_timeout(500)
    page.screenshot(path="/home/jules/verification/screenshots/3_library_view.png")

    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
