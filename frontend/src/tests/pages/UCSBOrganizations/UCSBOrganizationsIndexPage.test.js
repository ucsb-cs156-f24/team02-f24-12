import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UCSBOrganizationsIndexPage from "main/pages/UCSBOrganizations/UCSBOrganizationsIndexPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import mockConsole from "jest-mock-console";
import { ucsbOrganizationsFixtures } from "fixtures/ucsbOrganizationsFixtures";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = jest.fn();
jest.mock("react-toastify", () => {
  const originalModule = jest.requireActual("react-toastify");
  return {
    __esModule: true,
    ...originalModule,
    toast: (x) => mockToast(x),
  };
});

describe("UCSBOrganizationsIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  const testId = "UCSBOrganizationsTable";

  const setupUserOnly = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const setupAdminUser = () => {
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const queryClient = new QueryClient();

  test("Renders with Create Button for admin user", async () => {
    setupAdminUser();
    axiosMock.onGet("/api/ucsborganizations/all").reply(200, []);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Create UCSBOrganizations/)).toBeInTheDocument();
    });
    const button = screen.getByText(/Create UCSBOrganizations/);
    expect(button).toHaveAttribute("href", "/ucsborganizations/create");
    expect(button).toHaveAttribute("style", "float: right;");
  });

  test("renders three organizations correctly for regular user", async () => {
    setupUserOnly();
    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, ucsbOrganizationsFixtures.threeOrganizations);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-orgcode`),
      ).toHaveTextContent("SKY");
    });
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-orgcode`),
    ).toHaveTextContent("OSLI");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-orgcode`),
    ).toHaveTextContent("KRC");

    const createUCSBOrganizationsButton = screen.queryByText(
      "Create Organization",
    );
    expect(createUCSBOrganizationsButton).not.toBeInTheDocument();

    const orgTranslationShort = screen.getByText("STUDENT LIFE");
    expect(orgTranslationShort).toBeInTheDocument();

    const orgTranslation = screen.getByText("OFFICE OF STUDENT LIFE");
    expect(orgTranslation).toBeInTheDocument();
    const inactive = screen.getByText("Yes");
    expect(inactive).toBeInTheDocument();

    // for non-admin users, details button is visible, but the edit and delete buttons should not be visible
    expect(
      screen.queryByTestId(
        "UCSBOrganizationsTable-cell-row-0-col-Delete-button",
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText("Create UCSBOrganizations"),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByTestId("UCSBOrganizationsTable-cell-row-0-col-Edit-button"),
    ).not.toBeInTheDocument();
  });

  test("renders empty table when backend unavailable, user only", async () => {
    setupUserOnly();

    axiosMock.onGet("/api/ucsborganizations/all").timeout();

    const restoreConsole = mockConsole();

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(axiosMock.history.get.length).toBeGreaterThanOrEqual(1);
    });

    const errorMessage = console.error.mock.calls[0][0];
    expect(errorMessage).toMatch(
      "Error communicating with backend via GET on /api/ucsborganizations/all",
    );
    restoreConsole();
  });

  test("what happens when you click delete, admin", async () => {
    setupAdminUser();

    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, ucsbOrganizationsFixtures.threeOrganizations);
    axiosMock
      .onDelete("/api/ucsborganizations")
      .reply(200, "Organization with orgcode OSLI was deleted");

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationsIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId(`${testId}-cell-row-0-col-orgcode`),
      ).toBeInTheDocument();
    });

    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-orgcode`),
    ).toHaveTextContent("SKY");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockToast).toBeCalledWith(
        "Organization with orgcode OSLI was deleted",
      );
    });

    await waitFor(() => {
      expect(axiosMock.history.delete.length).toBe(1);
    });
    expect(axiosMock.history.delete[0].url).toBe("/api/ucsborganizations");
    expect(axiosMock.history.delete[0].url).toBe("/api/ucsborganizations");
    expect(axiosMock.history.delete[0].params).toEqual({ orgcode: "SKY" });
  });
});
