from playwright.sync_api import sync_playwright, expect

def verify_app():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()

        print("Navigating to app...")
        page.goto("http://localhost:5175")

        # Wait for start overlay
        print("Waiting for start overlay...")
        start_btn = page.locator(".start-btn")
        expect(start_btn).to_be_visible()

        # Take screenshot of start screen
        page.screenshot(path="verification_start.png")
        print("Captured start screen.")

        # Click start (force=True because of animation)
        print("Clicking start...")
        start_btn.click(force=True)

        # Wait for main interface
        print("Waiting for main interface...")
        expect(page.locator(".main-interface")).to_be_visible()

        # Wait for potential initial loading to finish (e.g., piano samples)
        print("Waiting for initial loading overlay to disappear...")
        expect(page.locator(".loading-overlay")).to_be_hidden(timeout=10000)

        # Take screenshot of main interface
        page.screenshot(path="verification_main.png")
        print("Captured main interface.")

        # Toggle some controls
        print("Toggling controls...")

        # Change instrument to Guitar
        # Use force=True to bypass potential overlay issues if timing is tight, but properly waiting is better.
        print("Clicking Guitar...")
        page.locator(".instrument-btn").filter(has_text="Guitar").first.click()

        # Changing instrument triggers loading. Wait for it.
        print("Waiting for loading to finish...")
        expect(page.locator(".loading-overlay")).to_be_hidden(timeout=10000)

        # Change Sound Mode to Computer
        print("Clicking Computer...")
        page.locator("button").filter(has_text="Computer").click()

        # Change Scale to Full
        print("Clicking Full...")
        page.locator("button").filter(has_text="Full").click()

        # Take screenshot of toggled state
        page.screenshot(path="verification_toggled.png")
        print("Captured toggled state.")

        # Verify Melody button exists
        expect(page.locator("button").filter(has_text="Melody")).to_be_visible()

        browser.close()

if __name__ == "__main__":
    verify_app()
