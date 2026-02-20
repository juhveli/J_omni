from playwright.sync_api import Page, expect, sync_playwright
import time

def test_verify_improvements(page: Page):
    # 1. Navigate to the app
    page.goto("http://localhost:5173")

    # 2. Tap to Start
    page.click("text=Tap to Start!", force=True)

    # Wait for app to load
    expect(page.get_by_role("heading", name="Unicorn Music")).to_be_visible()

    # Wait for initial instrument (Piano) to load or fail gracefully
    try:
        expect(page.locator(".loading-overlay")).not_to_be_visible(timeout=10000)
    except:
        print("Piano still loading or failed, continuing...")

    # 3. Check Visualizer
    expect(page.locator("canvas")).to_be_visible()

    # 4. Toggle Pro Mode
    page.click("text=Pro")

    # 5. Verify Effects Rack
    expect(page.get_by_text("Reverb")).to_be_visible()
    expect(page.get_by_text("Delay")).to_be_visible()
    expect(page.get_by_text("Filter")).to_be_visible()

    # 6. Check Looper Studio
    page.click("text=Record")
    expect(page.get_by_text("Looper Studio")).to_be_visible()
    expect(page.get_by_text("Add Layer")).to_be_visible()

    # 7. Close Studio
    page.click("text=×")

    # 8. Check Drums
    page.get_by_role("button", name="🥁 Drums").click()

    # Wait for drums to load or fail gracefully
    try:
        expect(page.locator(".loading-overlay")).not_to_be_visible(timeout=10000)
    except:
        print("Drums still loading or failed, continuing...")

    # Should see drum emojis in the note buttons
    expect(page.locator(".note-label").get_by_text("🥁")).to_be_visible()

    # Take final screenshot
    page.screenshot(path="/home/jules/verification/final_verification.png", full_page=True)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_verify_improvements(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error_final.png")
        finally:
            browser.close()
