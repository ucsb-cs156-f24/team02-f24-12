import { toast } from "react-toastify";

// Stryker disable all
export function onDeleteSuccess(message) {
  console.log(message);
  toast(message);
}
// Stryker restore all

export function cellToAxiosParamsDelete(cell) {
  return {
    // Stryker disable all
    url: "/api/recommendationRequests",
    // Stryker restore all
    method: "DELETE",
    params: {
      id: cell.row.values.id,
    },
  };
}
