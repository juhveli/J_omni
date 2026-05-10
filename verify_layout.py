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
        if "🌈 Simple" in content and "🎹 Full" in content:
            print("New labels present.")
        else:
            print("New labels NOT found.")

        page.screenshot(path="/home/jules/verification/layout_polish.png")
        browser.close()

if __name__ == "__main__":
    run()
