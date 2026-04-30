from playwright.sync_api import sync_playwright

def verify_metronome():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.goto("http://localhost:5175")

        # Click start with force=True for animated elements
        page.locator(".start-btn").click(force=True)

        # Wait for app to be ready
        page.wait_for_selector(".main-interface")

        # Click metronome toggle
        metronome_btn = page.locator("button.control-btn:has-text('⏱️ Metronome')")
        metronome_btn.click(force=True)

        # Verify active state
        if metronome_btn.evaluate("el => el.classList.contains('active')"):
            print("Metronome button became active")
        else:
            print("Failed: Metronome button did not become active")

        # Adjust slider
        slider = page.locator("input[type='range']")
        slider.fill("180")

        if page.locator("span:has-text('180 BPM')").count() > 0:
            print("BPM slider updated text")
        else:
            print("Failed: BPM text not updated")

        browser.close()

if __name__ == "__main__":
    verify_metronome()
