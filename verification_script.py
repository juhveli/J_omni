from playwright.sync_api import sync_playwright, expect

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5175")

        print("Waiting for start overlay...")
        page.wait_for_selector(".start-overlay", state="visible")
        page.screenshot(path="verification_start.png")
        print("Captured start screen.")

        print("Clicking start...")
        page.click(".start-btn", force=True)

        print("Waiting for main interface...")
        page.wait_for_selector(".main-interface", state="visible")

        print("Waiting for initial loading overlay to disappear...")
        page.wait_for_selector(".loading-overlay", state="hidden")

        # Take a screenshot to verify Metronome UI
        page.screenshot(path="verification_metronome.png")
        print("Captured main interface with Metronome UI.")

        # Click Metronome toggle
        metronome_btn = page.get_by_role("button", name="⏱️ Metronome")
        metronome_btn.click(force=True)
        print("Toggled Metronome.")

        page.screenshot(path="verification_metronome_active.png")
        print("Captured active Metronome state.")

        browser.close()

if __name__ == "__main__":
    verify_app()
