from playwright.sync_api import sync_playwright

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:5175")
        page.click(".start-overlay")
        page.wait_for_selector(".controls-container")

        # Check text
        content = page.content()
        if "⏱️ Metronome" in content:
            print("Metronome button found.")
        else:
            print("Metronome button NOT found.")

        # Click metronome button
        page.click(".metronome-btn")

        # Check if metronome button is active
        page.wait_for_selector(".metronome-btn.active")
        print("Metronome button active.")

        page.screenshot(path="/home/jules/verification/metronome.png")
        browser.close()

if __name__ == "__main__":
    run()
