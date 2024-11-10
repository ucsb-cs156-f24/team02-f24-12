import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router-dom";
import UCSBOrganizationsForm from "main/components/UCSBOrganizations/UCSBOrganizationsForm";
import { Navigate } from "react-router-dom";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationsEditPage({ storybook = false }) {
  let { orgcode } = useParams();

  const {
    data: ucsbOrganizations,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/ucsborganizations?orgcode=${orgcode}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug
      method: "GET",
      url: `/api/ucsborganizations`,
      params: {
        orgcode,
      },
    },
  );

  const objectToAxiosPutParams = (ucsbOrganizations) => ({
    url: "/api/ucsborganizations",
    method: "PUT",
    params: {
      orgcode: ucsbOrganizations.orgcode,
    },
    data: {
      orgcode: ucsbOrganizations.orgcode,
      orgTranslationShort: ucsbOrganizations.orgTranslationShort,
      orgTranslation: ucsbOrganizations.orgTranslation,
      inactive: ucsbOrganizations.inactive,
    },
  });

  const onSuccess = (ucsbOrganizations) => {
    toast(
      `Organization Update - orgcode: ${ucsbOrganizations.orgcode} orgTranslationShort: ${ucsbOrganizations.orgTranslationShort}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    [`/api/ucsbOrganizations?orgcode=${orgcode}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsborganizations" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit UCSBOrganizations</h1>
        {ucsbOrganizations && (
          <UCSBOrganizationsForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={ucsbOrganizations}
          />
        )}
      </div>
    </BasicLayout>
  );
}
