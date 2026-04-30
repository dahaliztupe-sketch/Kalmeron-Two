import { describe, expect, it } from "vitest";
import { formatRunwayEmail } from "@/app/api/cron/runway-alerts/route";

describe("formatRunwayEmail", () => {
  it("renders Arabic subject with formatted months", () => {
    const out = formatRunwayEmail({
      email: "founder@example.com",
      name: "أحمد",
      inputs: {
        cashEgp: 60_000,
        monthlyIncomeEgp: 0,
        monthlyBurnEgp: 30_000,
        thresholdMonths: 6,
      },
    });
    expect(out.subject).toMatch(/تنبيه نفاد النقد/);
    // 60k / 30k = 2 months
    expect(out.subject).toMatch(/شهر|mo|2/);
    expect(out.text).toContain("أهلاً أحمد");
    expect(out.text).toContain("https://kalmeron.app/cash-runway");
  });

  it("uses neutral greeting when name is missing", () => {
    const out = formatRunwayEmail({
      email: "founder@example.com",
      inputs: {
        cashEgp: 30_000,
        monthlyIncomeEgp: 0,
        monthlyBurnEgp: 30_000,
        thresholdMonths: 6,
      },
    });
    expect(out.text).toContain("أهلاً،");
    expect(out.text).not.toContain("أهلاً undefined");
  });

  it("includes RTL container and CTA in HTML body", () => {
    const out = formatRunwayEmail({
      email: "founder@example.com",
      inputs: {
        cashEgp: 30_000,
        monthlyIncomeEgp: 0,
        monthlyBurnEgp: 30_000,
        thresholdMonths: 6,
      },
    });
    expect(out.html).toContain('dir="rtl"');
    expect(out.html).toMatch(/افتح لوحة كلميرون/);
    expect(out.html).toMatch(/href="https:\/\/kalmeron\.app\/cash-runway"/);
  });

  it("emits the user's threshold inside the message body", () => {
    const out = formatRunwayEmail({
      email: "founder@example.com",
      inputs: {
        cashEgp: 100_000,
        monthlyIncomeEgp: 0,
        monthlyBurnEgp: 50_000,
        thresholdMonths: 4,
      },
    });
    expect(out.text).toContain("4 شهر");
    expect(out.html).toContain("<strong>4 شهر</strong>");
  });

  it("includes exactly 3 numbered recommendations in the text body", () => {
    const out = formatRunwayEmail({
      email: "founder@example.com",
      inputs: {
        cashEgp: 30_000,
        monthlyIncomeEgp: 0,
        monthlyBurnEgp: 30_000,
        thresholdMonths: 6,
      },
    });
    // Lines like "1. …", "2. …", "3. …"
    const numbered = out.text
      .split("\n")
      .filter((l) => /^[123]\. /.test(l));
    expect(numbered.length).toBe(3);
  });
});
