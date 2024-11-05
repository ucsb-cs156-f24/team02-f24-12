import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import UCSBOrganizationsForm from "main/components/UCSBOrganizations/UCSBOrganizationsForm";
import { ucsbOrganizationsFixtures } from "fixtures/ucsbOrganizationsFixtures";

import { QueryClient, QueryClientProvider } from "react-query";

const mockedNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockedNavigate,
}));

describe("UCSBOrganizationsForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = ["orgcode", "orgTranslationShort", "orgTranslation", "inactive?"];
  const testId = "UCSBOrganizationsForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationsForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => { 
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationsForm initialContents={ucsbOrganizationsFixtures.oneOrganization} />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
    

    expect(await screen.findByTestId(`${testId}-orgcode`)).toBeInTheDocument();
    expect(screen.getByText(`orgcode`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationsForm />
        </Router>
      </QueryClientProvider>,
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <UCSBOrganizationsForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/orgcode is required/);
    await screen.findByText(/orgTranslationShort is required/);
    expect(screen.getByText(/orgTranslation is required/)).toBeInTheDocument();
  });

  test("No Error messsages on good input", async () => {
    const mockSubmitAction = jest.fn();
    render(
      <Router>
        <UCSBOrganizationsForm submitAction={mockSubmitAction} />
      </Router>,
    );    
    await screen.findByTestId(`${testId}-orgcode`);
    const orgcode = screen.getByTestId(`${testId}-orgcode`);
    const orgTranslationShort = screen.getByTestId(`${testId}-orgTranslationShort`);
    const orgTranslation = screen.getByTestId(`${testId}-orgTranslation`);
    const inactive = screen.getByTestId(`${testId}-inactive`);

    const submitButton = screen.getByText(/Create/);
    fireEvent.change(orgcode, { target: { value: "ORG" } });
    fireEvent.change(orgTranslationShort, { target: { value: "ORG short discription" } });
    fireEvent.change(orgTranslation, { target: { value: "ORG full name" } });
    fireEvent.change(inactive, { target: { value: "true" } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalled());
    expect(
      screen.queryByText(
        /orgcode is required/,
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        /orgTranslationShort is required/,
      ),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/orgTranslation is required/),
    ).not.toBeInTheDocument();
  });
});
