from playwright.sync_api import sync_playwright

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5175")
        page.wait_for_selector(".start-overlay")
        page.screenshot(path="verification_start.png")

        page.click(".start-overlay", force=True)
        page.wait_for_selector(".main-interface")
        page.screenshot(path="verification_main.png")

        print("Checking Metronome features...")
        # Check Metronome
        metronome_btn = page.locator("button.control-btn", has_text="⏱️ Metronome")
        metronome_btn.click()
        page.wait_for_timeout(500) # give it half a sec to update
        page.screenshot(path="verification_metronome.png")

        browser.close()

if __name__ == "__main__":
    verify_app()
