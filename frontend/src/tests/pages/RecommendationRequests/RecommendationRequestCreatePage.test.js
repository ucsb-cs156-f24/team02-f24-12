import { render, waitFor, fireEvent, screen } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequests/RecommendationRequestCreatePage";
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

describe("RecommendationRequest 'Create' Page tests", () => {
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
  });

  test("renders without crashing", async () => {
    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-explanation"),
      ).toBeInTheDocument();
    });
  });

  test("when you fill in the form and hit submit, it makes a request to the backend", async () => {
    const queryClient = new QueryClient();
    const req = {
      id: 2,
      requesterEmail: "ethelcain@gmail.com",
      professorEmail: "charlixcx@ucsb.edu",
      explanation: "Listen to my album.",
      dateRequested: "2021-10-31T00:00",
      dateNeeded: "2022-12-31T00:00",
      doneBool: "true",
    };

    axiosMock.onPost("/api/recommendationrequests/post").reply(202, req);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("RecommendationRequestForm-explanation"),
      ).toBeInTheDocument();
    });

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

    // const req = {
    //   id: 2,
    //   requesterEmail: "ethelcain@gmail.com",
    //   professorEmail: "charlixcx@ucsb.edu",
    //   explanation: "Listen to my album.",
    //   dateRequested: "2021-10-31T00:00:00",
    //   dateNeeded: "2022-12-31T00:00:00",
    //   done: true,
    // };

    fireEvent.change(requesterEmailField, {
      target: { value: "ethelcain@gmail.com" },
    });
    fireEvent.change(professorEmailField, {
      target: { value: "charlixcx@ucsb.edu" },
    });
    fireEvent.change(dateRequestedField, {
      target: { value: "2021-10-31T00:00" },
    });
    fireEvent.change(dateNeededField, {
      target: { value: "2022-12-31T00:00" },
    });
    fireEvent.change(doneField, { target: { value: "true" } });
    fireEvent.change(explanationField, {
      target: { value: "Listen to my album." },
    });

    expect(submitButton).toBeInTheDocument();

    fireEvent.click(submitButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "ethelcain@gmail.com",
      professorEmail: "charlixcx@ucsb.edu",
      explanation: "Listen to my album.",
      dateRequested: "2021-10-31T00:00",
      dateNeeded: "2022-12-31T00:00",
      doneBool: "true",
    });

    expect(mockToast).toBeCalledWith(
      "New recommendation request Created - id: 2 requester email: ethelcain@gmail.com",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/recommendationRequests" });
  });
});
