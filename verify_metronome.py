from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5175")

        # Tap to start
        page.click(".start-btn", force=True)

        # Wait for controls
        page.wait_for_selector(".controls-container")

        # Verify Metronome button is present
        content = page.content()
        if "⏱️ Metronome" in content:
            print("Metronome button present.")
        else:
            print("Metronome button NOT found.")

        # Try to click it
        page.locator("text=⏱️ Metronome").click()

        # Wait for the BPM input
        page.wait_for_selector("input[type='range']")

        if "BPM:" in page.content():
            print("Metronome BPM slider present.")
        else:
            print("Metronome BPM slider NOT found.")

        page.screenshot(path="metronome_verification.png")
        browser.close()

if __name__ == "__main__":
    run()
