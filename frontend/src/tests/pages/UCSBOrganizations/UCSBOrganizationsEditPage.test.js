import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";
import UCSBOrganizationsEditPage from "main/pages/UCSBOrganizations/UCSBOrganizationsEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "jest-mock-console";

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
    useParams: () => ({
      orgcode: "ORG",
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("UCSBOrganizationsEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/ucsborganizations", { params: { orgcode: "ORG" } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit UCSBOrganizations");
      expect(screen.queryByTestId("UCSBOrganizations-orgcode")).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    const axiosMock = new AxiosMockAdapter(axios);

    beforeEach(() => {
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock.onGet("/api/ucsborganizations", { params: { orgcode: "ORG" } }).reply(200, {
        orgcode: "ORG",
        orgTranslationShort: "Some Org",
        orgTranslation: "Some Organization",
        inactive: false,
      });
      axiosMock.onPut("/api/ucsborganizations").reply(200, {
        orgcode: "ORG",
        orgTranslationShort: "Other Org",
        orgTranslation: "Other Organization",
        inactive: "true",
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationsForm-orgcode");

      const orgcodeField = screen.getByTestId("UCSBOrganizationsForm-orgcode");
      const orgTranslationShortField = screen.getByTestId("UCSBOrganizationsForm-orgTranslationShort");
      const orgTranslationField = screen.getByTestId("UCSBOrganizationsForm-orgTranslation");
      const inactiveField = screen.getByTestId("UCSBOrganizationsForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationsForm-submit");

      expect(orgcodeField).toBeInTheDocument();
      expect(orgcodeField).toHaveValue("ORG");
      expect(orgTranslationShortField).toBeInTheDocument();
      expect(orgTranslationShortField).toHaveValue("Some Org");
      expect(orgTranslationField).toBeInTheDocument();
      expect(orgTranslationField).toHaveValue("Some Organization");
      expect(inactiveField).toBeInTheDocument();
      expect(inactiveField).toHaveValue("false");

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(orgTranslationShortField, {
        target: { value: "Other Org" },
      });
      fireEvent.change(orgTranslationField, {
        target: { value: "Other Organization" },
      });
      fireEvent.change(inactiveField, {
        target: { value: "true" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Organization Update - orgcode: ORG orgTranslationShort: Other Org",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganizations" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ orgcode: "ORG" });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          orgcode: "ORG",
          orgTranslationShort: "Other Org",
          orgTranslation: "Other Organization",
          inactive: "true",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <UCSBOrganizationsEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("UCSBOrganizationsForm-orgcode");

      const orgcodeField = screen.getByTestId("UCSBOrganizationsForm-orgcode");
      const orgTranslationShortField = screen.getByTestId("UCSBOrganizationsForm-orgTranslationShort");
      const orgTranslationField = screen.getByTestId("UCSBOrganizationsForm-orgTranslation");
      const inactiveField = screen.getByTestId("UCSBOrganizationsForm-inactive");
      const submitButton = screen.getByTestId("UCSBOrganizationsForm-submit");

      expect(orgcodeField).toHaveValue("ORG");
      expect(orgTranslationShortField).toHaveValue("Some Org");
      expect(orgTranslationField).toHaveValue("Some Organization");
      expect(inactiveField).toHaveValue("false");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(orgTranslationShortField, {
        target: { value: "Other Org" },
      });
      fireEvent.change(orgTranslationField, { target: { value: "Other Organization" } });
      fireEvent.change(inactiveField, { target: { value: "true" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Organization Update - orgcode: ORG orgTranslationShort: Other Org",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/ucsborganizations" });
    });
  });
});
