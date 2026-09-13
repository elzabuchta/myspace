from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:8000/index.html")
    page.wait_for_timeout(1000)

    # Click Sam's diary entry
    page.click("text=Sam Carmichael")
    page.wait_for_timeout(1000)

    # Click Bill's diary entry
    page.click("text=Bill Anderson")
    page.wait_for_timeout(1000)

    # Click Harry's diary entry
    page.click("text=Harry Bright")
    page.wait_for_timeout(1000)

    # Play Music Track
    page.click("#play-btn")
    page.wait_for_timeout(1000)

    # Take screenshot
    page.screenshot(path="/home/jules/verification/screenshots/myspace_donna.png", full_page=True)
    page.wait_for_timeout(1000)

if __name__ == "__main__":
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
