import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";

import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/UCSBOrganizationsUtils";
import { useNavigate } from "react-router-dom";
import { hasRole } from "main/utils/currentUser";

export default function UCSBOrganizationsTable({
  ucsbOrganizations,
  currentUser,
  testIdPrefix = "UCSBOrganizationsTable",
}) {
  const navigate = useNavigate();

  const editCallback = (cell) => {
    navigate(`/ucsborganizations/edit/${cell.row.values.orgcode}`);
  };

  // Stryker disable all : hard to test for query caching

  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/ucsborganizations/all"],
  );
  // Stryker restore all

  // Stryker disable next-line all : TODO try to make a good test for this
  const deleteCallback = async (cell) => {
    deleteMutation.mutate(cell);
  };

  const columns = [
    {
      Header: "orgcode",
      accessor: "orgcode", // accessor is the "key" in the data
    },

    {
      Header: "orgTranslationShort",
      accessor: "orgTranslationShort",
    },
    {
      Header: "orgTranslation",
      accessor: "orgTranslation",
    },
    {
      Header: "inactive?",
      accessor: "inactive",
      Cell: ({ value }) => (value ? "Yes" : "No"),
    },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(ButtonColumn("Edit", "primary", editCallback, testIdPrefix));
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, testIdPrefix),
    );
  }

  return (
    <OurTable
      data={ucsbOrganizations}
      columns={columns}
      testid={testIdPrefix}
    />
  );
}
