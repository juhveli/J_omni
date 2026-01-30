from playwright.sync_api import sync_playwright, expect
import re

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5173")

        # Click start
        try:
            page.click(".start-overlay", timeout=5000)
        except:
            print("Start overlay not found or already dismissed.")

        page.wait_for_selector(".controls-container")

        # 1. Verify "Record" button exists and is disabled
        # Using a more specific selector or just text match
        record_btn = page.locator("button").filter(has_text="🎙️ Record")
        expect(record_btn).to_be_visible()
        expect(record_btn).to_be_disabled()
        print("Record button verified.")

        # 2. Verify Keyboard Hints in Simple Mode
        # Check if hint 'A' exists (for C note)
        hints = page.locator(".keyboard-hint")
        expect(hints.first).to_be_visible()
        count = hints.count()
        print(f"Found {count} keyboard hints.")

        # Take screenshot of Simple Mode
        page.screenshot(path="verification/simple_mode.png")
        print("Simple mode screenshot taken.")

        # 3. Switch to Full Mode and Verify Piano Layout
        page.get_by_role("button", name="🎹 Full").click()

        # Wait for transition/re-render
        page.wait_for_timeout(1000)

        # Verify "Full" mode is active on the pad
        # Note: expect(...).to_have_class requires exact string or regex.
        # The class might be "instrument-pad full"
        pad = page.locator(".instrument-pad")
        expect(pad).to_have_class(re.compile(r"full"))

        # Verify Sharps have special class
        sharps = page.locator(".note-btn.sharp")
        expect(sharps.first).to_be_visible()
        print(f"Found {sharps.count()} sharp keys.")

        # Take screenshot of Full Mode
        page.screenshot(path="verification/full_mode.png")
        print("Full mode screenshot taken.")

        browser.close()

if __name__ == "__main__":
    run()
