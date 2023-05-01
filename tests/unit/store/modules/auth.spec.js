import { login } from "@/store/modules/auth";
import { restoreSession } from "@/store/modules/auth";

describe("authentication", () => {
  it("should successfully authenticate", async () => {
    const response = await authenticate();
    expect(response.status).toBe(200);
    expect(response.sessionToken).toBeDefined();
  });
});
