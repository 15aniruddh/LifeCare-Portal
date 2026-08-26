/** The login page: password form plus the Google button it only sometimes shows. */
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import Login from "./Login";
import LoginApi from "../../services/LoginApi";
import { getAccessToken } from "../../services/httpAuth";

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

jest.mock("../../services/LoginApi");
// Swal renders outside the tree and is not what these tests are about.
jest.mock("sweetalert2", () => ({ fire: jest.fn() }));

const session = {
  id: 7,
  name: "Asha Rao",
  role: "user",
  access_token: "token-abc",
  expires_in: 28800,
};

function renderLogin() {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
}

/** Providers is fetched on mount; default to Google being unconfigured. */
function providersReturn(google) {
  LoginApi.getProviders.mockResolvedValue({ data: { password: true, google } });
}

beforeEach(() => {
  jest.clearAllMocks();
  sessionStorage.clear();
  providersReturn(false);
});

describe("the Google button", () => {
  it("is hidden while the backend has no Google credentials", async () => {
    renderLogin();

    await waitFor(() => expect(LoginApi.getProviders).toHaveBeenCalled());
    expect(screen.queryByRole("button", { name: /continue with google/i })).toBeNull();
  });

  it("appears once the backend reports Google is configured", async () => {
    providersReturn(true);
    renderLogin();

    expect(
      await screen.findByRole("button", { name: /continue with google/i })
    ).toBeInTheDocument();
  });

  it("hands the page over to Google when pressed", async () => {
    providersReturn(true);
    renderLogin();

    await userEvent.click(
      await screen.findByRole("button", { name: /continue with google/i })
    );
    expect(LoginApi.startGoogleLogin).toHaveBeenCalledTimes(1);
  });

  it("disables itself during the redirect, so it cannot be pressed twice", async () => {
    providersReturn(true);
    renderLogin();

    const button = await screen.findByRole("button", { name: /continue with google/i });
    await userEvent.click(button);

    const busy = screen.getByRole("button", { name: /taking you to google/i });
    expect(busy).toBeDisabled();
    await userEvent.click(busy);
    expect(LoginApi.startGoogleLogin).toHaveBeenCalledTimes(1);
  });

  it("leaves the password form usable if the providers probe fails", async () => {
    LoginApi.getProviders.mockRejectedValue(new Error("offline"));
    renderLogin();

    await waitFor(() => expect(LoginApi.getProviders).toHaveBeenCalled());
    expect(screen.getByRole("button", { name: /^login$/i })).toBeEnabled();
    expect(screen.queryByRole("button", { name: /continue with google/i })).toBeNull();
  });
});

describe("the password form", () => {
  it("stores the session and routes on success", async () => {
    LoginApi.loginUser.mockResolvedValue({ data: session });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "asha@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "Password@123");
    await userEvent.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/userdashboard"));
    expect(LoginApi.loginUser).toHaveBeenCalledWith({
      email: "asha@example.com",
      password: "Password@123",
    });
    expect(getAccessToken()).toBe("token-abc");
  });

  it("rejects a malformed email before calling the API", async () => {
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "not-an-email");
    await userEvent.type(screen.getByLabelText(/password/i), "whatever");
    await userEvent.click(screen.getByRole("button", { name: /^login$/i }));

    expect(await screen.findByText(/enter a valid email/i)).toBeInTheDocument();
    expect(LoginApi.loginUser).not.toHaveBeenCalled();
  });

  it("requires a password before calling the API", async () => {
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "asha@example.com");
    await userEvent.click(screen.getByRole("button", { name: /^login$/i }));

    expect(await screen.findByText(/enter your password/i)).toBeInTheDocument();
    expect(LoginApi.loginUser).not.toHaveBeenCalled();
  });

  it("stores nothing when the credentials are refused", async () => {
    LoginApi.loginUser.mockRejectedValue({ response: { status: 401, data: {} } });
    renderLogin();

    await userEvent.type(screen.getByLabelText(/email/i), "asha@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "wrong");
    await userEvent.click(screen.getByRole("button", { name: /^login$/i }));

    await waitFor(() => expect(LoginApi.loginUser).toHaveBeenCalled());
    expect(getAccessToken()).toBeNull();
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
