import { Button, Form } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function UCSBOrganizationsForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  // Stryker disable all
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });
  // Stryker restore all

  const navigate = useNavigate();

  const testIdPrefix = "UCSBOrganizationsForm";

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgcode">orgcode</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-orgcode"}
          id="orgcode"
          type="text"
          isInvalid={Boolean(errors.orgcode)}
          //value={initialContents.orgcode}
          {...register("orgcode", {
            required: "orgcode is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgcode?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgTranslationShort">orgTranslationShort</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-orgTranslationShort"}
          id="orgTranslationShort"
          type="text"
          isInvalid={Boolean(errors.orgTranslationShort)}
          {...register("orgTranslationShort", {
            required: "orgTranslationShort is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgTranslationShort?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="orgTranslation">orgTranslation</Form.Label>
        <Form.Control
          data-testid={testIdPrefix + "-orgTranslation"}
          id="orgTranslation"
          type="text"
          isInvalid={Boolean(errors.orgTranslation)}
          {...register("orgTranslation", {
            required: "orgTranslation is required.",
          })}
        />
        <Form.Control.Feedback type="invalid">
          {errors.orgTranslation?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label htmlFor="inactive">inactive?</Form.Label>
        <Form.Control
            data-testid={testIdPrefix + "-inactive"}
            id="inactive"
            as="select"
            isInvalid={Boolean(errors.inactive)}
            {...register("inactive", {})}
        >
            <option value="true">True</option>
            <option value="false">False</option>
        </Form.Control>
        <Form.Control.Feedback type="invalid">
            {errors.inactive?.message}
        </Form.Control.Feedback>
      </Form.Group>

      <Button type="submit" data-testid={testIdPrefix + "-submit"}>
        {buttonLabel}
      </Button>
      <Button
        variant="Secondary"
        onClick={() => navigate(-1)}
        data-testid={testIdPrefix + "-cancel"}
      >
        Cancel
      </Button>
    </Form>
  );
}

export default UCSBOrganizationsForm;
