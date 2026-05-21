from playwright.sync_api import sync_playwright, expect
import time

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5175")

        print("Clicking start...")
        page.locator(".start-btn").click(force=True)

        print("Waiting for main interface...")
        expect(page.locator(".main-interface")).to_be_visible()
        expect(page.locator(".loading-overlay")).to_be_hidden(timeout=10000)

        print("Locating metronome UI...")
        metronome_btn = page.locator("button").filter(has_text="Metronome")
        expect(metronome_btn).to_be_visible()

        print("Toggling metronome...")
        metronome_btn.click()
        expect(metronome_btn).to_have_class("control-btn active")

        print("Testing BPM slider...")
        slider = page.locator("input[type='range']")
        expect(slider).to_be_visible()

        # Take screenshot of metronome state
        page.screenshot(path="verification_metronome.png")
        print("Captured metronome state.")

        browser.close()

if __name__ == "__main__":
    verify_app()
