import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationRequestEditPage from "main/pages/RecommendationRequests/RecommendationRequestEditPage";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter } from "react-router-dom";

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
      id: 1,
    }),
    Navigate: (x) => {
      mockNavigate(x);
      return null;
    },
  };
});

describe("Recommendation Request 'Edit' Page tests", () => {
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
      axiosMock.onGet("/api/recommendationrequests", { params: { id: 1 } }).timeout();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Recommendation Request");
      expect(screen.queryByTestId("RecommendationRequest-explanation")).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/recommendationrequests", { params: { id: 1 } }).reply(200, {
        id: 1,
        requesterEmail: "javinzipkin@ucsb.edu",
        professorEmail: "ethelcain@gmail.com",
        explanation: "This year is amazing!",
        dateRequested: "2020-01-31T00:00",
        dateNeeded: "2020-12-31T00:00",
        doneBool: true,
      });
      axiosMock.onPut("/api/recommendationrequests").reply(200, {
        id: "1",
        requesterEmail: "No One",
        professorEmail: "ethelcain@gmail.com",
        explanation: "This year SUCKS!",
        dateRequested: "2020-01-31T00:00",
        dateNeeded: "2020-12-31T00:00",
        doneBool: "true",
      });
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");
      const idField = screen.getByTestId("RecommendationRequestForm-id");

      const requesterEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const professorEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail",
      );
      const explanationField = screen.getByTestId(
        "RecommendationRequestForm-explanation",
      );
      const dateRequestedField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested",
      );
      const dateNeededField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded",
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("1");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("This year is amazing!");
      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("javinzipkin@ucsb.edu");
      expect(doneField).toBeInTheDocument();
      expect(doneField).toHaveValue("true");
      expect(professorEmailField).toBeInTheDocument();
      expect(professorEmailField).toHaveValue("ethelcain@gmail.com");
      expect(dateRequestedField).toBeInTheDocument();
      expect(dateRequestedField).toHaveValue("2020-01-31T00:00");
      expect(dateNeededField).toBeInTheDocument();
      expect(dateNeededField).toHaveValue("2020-12-31T00:00");


      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(explanationField, {
        target: { value: "This year SUCKS!" },
      });
      fireEvent.change(requesterEmailField, {
        target: { value: "No One" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Recommendation Request Updated - id: 1 Requester Email: No One",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/recommendationRequests" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 1 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "No One",
          professorEmail: "ethelcain@gmail.com",
          explanation: "This year SUCKS!",
          dateNeeded: "2020-12-31T00:00",
          dateRequested: "2020-01-31T00:00",
          doneBool: "true",
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("RecommendationRequestForm-id");
      const idField = screen.getByTestId("RecommendationRequestForm-id");

      const requesterEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail",
      );
      const professorEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail",
      );
      const explanationField = screen.getByTestId(
        "RecommendationRequestForm-explanation",
      );
      const dateRequestedField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested",
      );
      const dateNeededField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded",
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId("RecommendationRequestForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("1");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("This year is amazing!");
      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("javinzipkin@ucsb.edu");
      expect(doneField).toBeInTheDocument();
      expect(doneField).toHaveValue("true");
      expect(professorEmailField).toBeInTheDocument();
      expect(professorEmailField).toHaveValue("ethelcain@gmail.com");
      expect(dateRequestedField).toBeInTheDocument();
      expect(dateRequestedField).toHaveValue("2020-01-31T00:00");
      expect(dateNeededField).toBeInTheDocument();
      expect(dateNeededField).toHaveValue("2020-12-31T00:00");

      fireEvent.change(requesterEmailField, {
        target: { value: "No One" },
      });
      fireEvent.change(professorEmailField, { target: { value: "You" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Recommendation Request Updated - id: 1 Requester Email: No One",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/recommendationRequests" });
    });
  });
});
