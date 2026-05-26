from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5175")
        page.click(".start-overlay", force=True)
        page.wait_for_selector(".controls-container")

        # Check text
        content = page.content()
        if "⏱️ Metronome" in content and "BPM:" in content:
            print("Metronome UI present.")
        else:
            print("Metronome UI NOT found.")

        page.screenshot(path="verification_metronome.png")
        browser.close()

if __name__ == "__main__":
    run()
