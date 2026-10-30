import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const widths = process.env.CHAT_TEST_WIDTH
  ? [Number(process.env.CHAT_TEST_WIDTH)]
  : [1920, 1440, 1366, 1024, 768, 390];
try {
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.addInitScript(() => {
      localStorage.setItem("auth_token", "demo-token");
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("isDemo", "true");
      localStorage.setItem("user_role", "student");
      localStorage.setItem("user", JSON.stringify({
        role: "student", studentId: 5, mentorId: 2, mentorName: "Test Mentor",
        courseName: "Test Course", batchName: "Test Batch",
      }));
    });
    await page.goto("http://127.0.0.1:4174/student/mentor-chat");
    await page.locator(".mentor-chat-window").waitFor({ timeout: 30000 });
    const geometry = await page.evaluate(() => {
      const pick = (selector) => {
        const box = document.querySelector(selector)?.getBoundingClientRect();
        return box && { x: box.x, y: box.y, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
      };
      return {
        viewport: window.innerWidth, documentWidth: document.documentElement.scrollWidth,
        header: pick('[data-ui="dashboard-header"]'), card: pick(".mentor-chat-workspace"),
        chatHeader: pick(".mentor-chat-window > header"), messages: pick(".mentor-chat-window > .custom-scrollbar"),
        composer: pick(".mentor-chat-window > div:last-child"), input: pick('.mentor-chat-window textarea'),
        send: pick('[aria-label="Send message"]'),
      };
    });
    if (geometry.documentWidth > width || !geometry.card || !geometry.composer || !geometry.send
      || geometry.card.right > width + 1 || geometry.send.right > geometry.card.right + 1
      || geometry.composer.bottom > geometry.card.bottom + 1
      || geometry.messages.bottom > geometry.composer.y + 1) {
      throw new Error(`Bad geometry at ${width}: ${JSON.stringify(geometry)}`);
    }
    await page.locator(".mentor-chat-window textarea").fill("A long message " + "L".repeat(500));
    try {
      await page.getByRole("button", { name: "Send message" }).click({ timeout: 3000 });
    } catch (error) {
      const assistant = await page.getByRole("button", { name: "Open Kini Assistant" }).boundingBox();
      const sendAfter = await page.getByRole("button", { name: "Send message" }).boundingBox();
      throw new Error(`Send obstructed at ${width}: before=${JSON.stringify(geometry.send)} after=${JSON.stringify(sendAfter)} assistant=${JSON.stringify(assistant)} ${error.message.slice(0, 100)}`);
    }
    const bubble = page.locator(".mentor-chat-window article").last();
    await bubble.waitFor();
    const bubbleBox = await bubble.locator("> div").boundingBox();
    if (!bubbleBox || bubbleBox.x + bubbleBox.width > geometry.card.right + 1) {
      throw new Error(`Bubble overflow at ${width}: ${JSON.stringify(bubbleBox)}`);
    }
    console.log(`${width}px: chat inside dashboard, composer visible, long message contained`);
    await page.close();
  }
} finally {
  await browser.close();
}
