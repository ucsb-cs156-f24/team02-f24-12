import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UCSBOrganizationsCreatePage from "main/pages/UCSBOrganizations/UCSBOrganizationsCreatePage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

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

const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => {
  const originalModule = jest.requireActual("react-router-dom");
  return {
    __esModule: true,
    ...originalModule,
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("UCSBOrganizationsCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("orgcode")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /ucsborganizations", async () => {
    const queryClient = new QueryClient();
    const ucsbOrganizations = {
      orgcode: "ORG",
      orgTranslationShort: "Some Org",
      orgTranslation: "Some Organization",
      inactive: "No",
    };

    axiosMock.onPost("/api/ucsborganizations/post").reply(202, ucsbOrganizations);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("orgcode")).toBeInTheDocument();
    });
      
    const orgcodeInput = screen.getByLabelText("orgcode");

    expect(orgcodeInput).toBeInTheDocument();
    const orgTranslationShortInput = screen.getByLabelText("orgTranslationShort");
    expect(orgTranslationShortInput).toBeInTheDocument();
    const orgTranslationInput = screen.getByLabelText("orgTranslation");
    expect(orgTranslationInput).toBeInTheDocument();
    const inactiveInput = screen.getByLabelText("inactive?");
    expect(inactiveInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(orgcodeInput, { target: { value: "ORG" } });
    fireEvent.change(orgTranslationShortInput, {
      target: { value: "Some Org" },
    });
    fireEvent.change(orgTranslationInput, {
      target: { value: "Some Organization" },
    });
    fireEvent.change(inactiveInput, {
      target: { value: "false" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgcode: "ORG",
      orgTranslationShort: "Some Org",
      orgTranslation: "Some Organization",
      inactive: "false",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toBeCalledWith(
      "New organization Created - orgcode: ORG orgTranslationShort: Some Org",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsbOrganizations" });
  });
});
