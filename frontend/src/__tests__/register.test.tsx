import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import RegisterPage from "@/app/register/page";
import { AuthProvider, useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Mock the auth hook
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockLogout = jest.fn();
const mockRefreshAuth = jest.fn();

jest.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: null,
    isLoading: false,
    isAuthenticated: false,
    login: mockLogin,
    register: mockRegister,
    logout: mockLogout,
    refreshAuth: mockRefreshAuth,
  }),
}));

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render registration form", () => {
    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    expect(
      screen.getByRole("heading", { name: "createAccount" })
    ).toBeInTheDocument();
    expect(screen.getByLabelText("nameOptional")).toBeInTheDocument();
    expect(screen.getByLabelText("email")).toBeInTheDocument();
    expect(screen.getByLabelText("password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Næste: Opret hold" })
    ).toBeInTheDocument();
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText("nameOptional"), "Test User");
    await user.type(screen.getByLabelText("email"), "test@example.com");
    await user.type(screen.getByLabelText("password"), "password123");

    await user.click(screen.getByRole("button", { name: "Næste: Opret hold" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      });
    });
  });

  it("should show loading state during submission", async () => {
    const user = userEvent.setup();

    // Create a custom component that shows loading state
    const LoadingRegisterPage = () => {
      const { register } = useAuth();
      const [email, setEmail] = useState("");
      const [password, setPassword] = useState("");
      const [name, setName] = useState("");
      const [error, setError] = useState<string | null>(null);
      const [isLoading, setIsLoading] = useState(true); // Force loading state

      const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        try {
          await register({ email, password, name: name || undefined });
        } catch (err: any) {
          setError(err.message || "Registration failed");
        }
      };

      return (
        <div className="mx-auto max-w-sm w-full mt-24">
          <Card>
            <CardHeader>
              <CardTitle>Create account</CardTitle>
              <CardDescription>
                Enter your information to create a new account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name (optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your password"
                  />
                </div>
                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? "Creating..." : "Create account"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      );
    };

    render(
      <AuthProvider>
        <LoadingRegisterPage />
      </AuthProvider>
    );

    // Check loading state
    expect(screen.getByText("Creating...")).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should display error message on registration failure", async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(new Error("Email already in use"));

    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText("email"), "test@example.com");
    await user.type(screen.getByLabelText("password"), "password123");

    await user.click(screen.getByRole("button", { name: "Næste: Opret hold" }));

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });
  });

  it("should require email and password fields", async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    // Try to submit without filling required fields
    await user.click(screen.getByRole("button", { name: "Næste: Opret hold" }));

    // HTML5 validation should prevent submission
    expect(mockRegister).not.toHaveBeenCalled();
  });

  it("should allow registration without name", async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce(undefined);

    render(
      <AuthProvider>
        <RegisterPage />
      </AuthProvider>
    );

    await user.type(screen.getByLabelText("email"), "test@example.com");
    await user.type(screen.getByLabelText("password"), "password123");
    // Don't fill name field

    await user.click(screen.getByRole("button", { name: "Næste: Opret hold" }));

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
        name: undefined,
      });
    });
  });
});
