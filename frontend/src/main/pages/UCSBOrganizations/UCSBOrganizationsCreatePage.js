import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBOrganizationsForm from "main/components/UCSBOrganizations/UCSBOrganizationsForm";
import { Navigate } from "react-router-dom";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationsCreatePage({ storybook = false }) {
  const objectToAxiosParams = (ucsbOrganizations) => ({
    url: "/api/ucsborganizations/post",
    method: "POST",
    params: {
      orgcode: ucsbOrganizations.orgcode,
      orgTranslationShort: ucsbOrganizations.orgTranslationShort,
      orgTranslation: ucsbOrganizations.orgTranslation,
      inactive: ucsbOrganizations.inactive,
    },
  });

  const onSuccess = (ucsbOrganizations) => {
    toast(
      `New organization Created - orgcode: ${ucsbOrganizations.orgcode} orgTranslationShort: ${ucsbOrganizations.orgTranslationShort}`,
    );
  };

  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/ucsborganizations/all"], // mutation makes this key stale so that pages relying on it reload
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/ucsbOrganizations" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Organization</h1>
        <UCSBOrganizationsForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
