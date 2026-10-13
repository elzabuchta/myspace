import os
from playwright.sync_api import sync_playwright

def run_cuj(page):
    filepath = "file://" + os.path.abspath("index.html")
    page.goto(filepath)
    page.wait_for_timeout(1000)

    # Navigate to Social / Sledování & Přátelé
    page.click("button:has-text('Sledování & Přátelé')")
    page.wait_for_timeout(500)
    page.screenshot(path="/home/jules/verification/screenshots/5_social_accounts.png")

    # Click on the first reader's account to open their profile & library modal
    page.click(".account-info")
    page.wait_for_timeout(500)
    page.screenshot(path="/home/jules/verification/screenshots/6_user_profile_modal.png")

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
