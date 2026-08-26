/** The screen Google's redirect lands on. */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import GoogleCallback from "./GoogleCallback";
import { getAccessToken } from "../../services/httpAuth";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

/** Put a fragment on the URL the way the backend's redirect does. */
function landOn(fragment) {
  window.history.replaceState(null, "", `/login/google/callback#${fragment}`);
}

function renderCallback() {
  return render(
    <MemoryRouter>
      <GoogleCallback />
    </MemoryRouter>
  );
}

beforeEach(() => {
  sessionStorage.clear();
  mockNavigate.mockClear();
  window.history.replaceState(null, "", "/");
});

it("stores the session and routes to the role's dashboard", async () => {
  landOn(
    "access_token=jwt-123&token_type=bearer&expires_in=28800&id=42&name=Asha+Rao&role=user"
  );
  renderCallback();

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith("/userdashboard", { replace: true })
  );
  expect(getAccessToken()).toBe("jwt-123");
  expect(JSON.parse(sessionStorage.getItem("user"))).toMatchObject({
    id: 42,
    name: "Asha Rao",
    role: "user",
  });
});

it("routes a hospital to the hospital dashboard", async () => {
  landOn("access_token=jwt-h&id=3&name=Apollo&role=hospital");
  renderCallback();

  await waitFor(() =>
    expect(mockNavigate).toHaveBeenCalledWith("/hospitaldashboard", { replace: true })
  );
});

it("wipes the token out of the address bar", async () => {
  landOn("access_token=jwt-123&id=42&name=Asha&role=user");
  renderCallback();

  await waitFor(() => expect(mockNavigate).toHaveBeenCalled());
  expect(window.location.hash).toBe("");
  expect(window.location.href).not.toContain("jwt-123");
});

it("shows the server's message when Google sign-in failed", async () => {
  landOn("error=Google+sign-in+was+cancelled.");
  renderCallback();

  expect(await screen.findByText("Could not sign you in")).toBeInTheDocument();
  expect(screen.getByText("Google sign-in was cancelled.")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /back to login/i })).toBeInTheDocument();
  expect(mockNavigate).not.toHaveBeenCalled();
  expect(getAccessToken()).toBeNull();
});

it("refuses a half-formed fragment instead of storing a broken session", async () => {
  landOn("access_token=jwt-123");  // no id, no role
  renderCallback();

  expect(await screen.findByText("Could not sign you in")).toBeInTheDocument();
  expect(getAccessToken()).toBeNull();
  expect(mockNavigate).not.toHaveBeenCalled();
});

it("says it is working while there is nothing wrong to report", () => {
  landOn("access_token=jwt-123&id=42&name=Asha&role=user");
  renderCallback();

  expect(screen.getByText(/signing you in/i)).toBeInTheDocument();
});
