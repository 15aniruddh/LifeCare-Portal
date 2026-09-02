/** The session store both sign-in paths write through. */
import {
  ROLE_HOME,
  clearSession,
  getAccessToken,
  storeSession,
} from "./httpAuth";

const session = (over = {}) => ({
  id: 7,
  name: "Asha Rao",
  role: "user",
  access_token: "token-abc",
  token_type: "bearer",
  expires_in: 28800,
  ...over,
});

beforeEach(() => sessionStorage.clear());

describe("storeSession", () => {
  it("stores a user under its own role key and reports the dashboard", () => {
    expect(storeSession(session())).toBe(ROLE_HOME.user);
    expect(JSON.parse(sessionStorage.getItem("user")).id).toBe(7);
    expect(sessionStorage.getItem("admin")).toBeNull();
  });

  it.each([
    ["admin", "/admindashboard"],
    ["hospital", "/hospitaldashboard"],
    ["user", "/userdashboard"],
  ])("sends a %s to %s", (role, home) => {
    expect(storeSession(session({ role }))).toBe(home);
    expect(sessionStorage.getItem(role)).not.toBeNull();
  });

  it("clears a previous role, so two sessions never coexist", () => {
    storeSession(session({ role: "admin" }));
    storeSession(session({ role: "user" }));

    expect(sessionStorage.getItem("admin")).toBeNull();
    expect(sessionStorage.getItem("user")).not.toBeNull();
  });

  it("treats an unrecognised role as a patient rather than throwing", () => {
    expect(storeSession(session({ role: "wizard" }))).toBe(ROLE_HOME.user);
    expect(JSON.parse(sessionStorage.getItem("user")).role).toBe("user");
  });
});

describe("getAccessToken", () => {
  it("finds the token whichever role is signed in", () => {
    storeSession(session({ role: "hospital" }));
    expect(getAccessToken()).toBe("token-abc");
  });

  it("is null with nothing stored", () => {
    expect(getAccessToken()).toBeNull();
  });

  it("discards a corrupt entry instead of throwing", () => {
    sessionStorage.setItem("user", "{not json");
    expect(getAccessToken()).toBeNull();
    expect(sessionStorage.getItem("user")).toBeNull();
  });
});

describe("clearSession", () => {
  it("removes every role key", () => {
    storeSession(session({ role: "admin" }));
    clearSession();
    expect(getAccessToken()).toBeNull();
  });
});
