import { describe, expect, it } from "vitest";
import { nextDestination, relativizeDestination } from "./rulePath";

const WINDOWS = ["C:\\Users\\User\\Downloads"];
const POSIX = ["/home/user/Downloads"];

describe("relativizeDestination", () => {
  it("stores a folder inside a watched folder relative to it", () => {
    expect(
      relativizeDestination("C:\\Users\\User\\Downloads\\Documents", WINDOWS)
    ).toBe("Documents");
    expect(
      relativizeDestination("/home/user/Downloads/Documents/Invoices", POSIX)
    ).toBe("Documents/Invoices");
  });

  it("stores '.' for the watched folder itself", () => {
    expect(relativizeDestination("C:\\Users\\User\\Downloads", WINDOWS)).toBe(".");
    expect(relativizeDestination("/home/user/Downloads/", POSIX)).toBe(".");
  });

  it("keeps a folder outside every watched folder absolute", () => {
    expect(relativizeDestination("D:\\Archive", WINDOWS)).toBe("D:\\Archive");
    expect(relativizeDestination("/home/user/Archive", POSIX)).toBe(
      "/home/user/Archive"
    );
  });

  it("does not match a folder that merely shares a name prefix", () => {
    expect(
      relativizeDestination("C:\\Users\\User\\Downloads Archive\\Docs", WINDOWS)
    ).toBe("C:\\Users\\User\\Downloads Archive\\Docs");
    expect(relativizeDestination("/home/user/Downloads2/Docs", POSIX)).toBe(
      "/home/user/Downloads2/Docs"
    );
  });

  it("matches Windows paths case-insensitively and across separators", () => {
    expect(
      relativizeDestination("c:/users/user/downloads/Documents", WINDOWS)
    ).toBe("Documents");
  });

  it("matches a forward-slash watched folder with a drive letter case-insensitively", () => {
    // A watched folder can be typed with forward slashes on Windows.
    expect(
      relativizeDestination("C:\\Users\\User\\Downloads\\Docs", [
        "c:/users/user/downloads",
      ])
    ).toBe("Docs");
  });

  it("matches case-insensitively when only the selected path looks like Windows", () => {
    // A forward-slash UNC share has neither a backslash nor a drive letter.
    expect(
      relativizeDestination("\\\\server\\share\\Docs", ["//SERVER/Share"])
    ).toBe("Docs");
  });

  it("keeps POSIX paths case-sensitive", () => {
    expect(relativizeDestination("/home/user/downloads/Docs", POSIX)).toBe(
      "/home/user/downloads/Docs"
    );
  });

  it("relativizes against any watched folder, not just the first", () => {
    const folders = ["/home/user/Downloads", "/mnt/media/Incoming"];
    expect(relativizeDestination("/mnt/media/Incoming/Clips", folders)).toBe(
      "Clips"
    );
  });

  it("picks the deepest matching watched folder", () => {
    expect(
      relativizeDestination("/home/user/Downloads/Work/Invoices", [
        "/home/user/Downloads",
        "/home/user/Downloads/Work",
      ])
    ).toBe("Invoices");
  });

  it("treats the filesystem root as a watched folder", () => {
    expect(relativizeDestination("/", ["/"])).toBe(".");
    expect(relativizeDestination("/home/user", ["/"])).toBe("home/user");
    // A deeper watched folder still wins over the root.
    expect(
      relativizeDestination("/home/user/Downloads/Docs", ["/", ...POSIX])
    ).toBe("Docs");
  });

  it("keeps the path absolute when there are no watched folders", () => {
    expect(relativizeDestination("/home/user/Downloads/Docs", [])).toBe(
      "/home/user/Downloads/Docs"
    );
  });
});

describe("nextDestination", () => {
  it("leaves the existing destination alone when the picker is cancelled", () => {
    expect(nextDestination(null, WINDOWS)).toBeNull();
    expect(nextDestination([], WINDOWS)).toBeNull();
    expect(nextDestination("", WINDOWS)).toBeNull();
  });

  it("unwraps a single-selection array", () => {
    expect(
      nextDestination(["C:\\Users\\User\\Downloads\\Documents"], WINDOWS)
    ).toBe("Documents");
  });
});
