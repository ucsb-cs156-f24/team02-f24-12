package edu.ucsb.cs156.example.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class UCSBOrganizationsWebIT extends WebTestCase {
    @Test
    public void admin_user_can_create_edit_delete_organization() throws Exception {
        setupUser(true);

        page.getByText("UCSB Organizations").click();

        page.getByText("Create UCSBOrganizations").click();
        assertThat(page.getByText("Create New Organization")).isVisible();
        page.getByTestId("UCSBOrganizationsForm-orgcode").fill("ORG");
        page.getByTestId("UCSBOrganizationsForm-orgTranslationShort").fill("Some Org");
        page.getByTestId("UCSBOrganizationsForm-orgTranslation").fill("Some Organization");
        page.getByTestId("UCSBOrganizationsForm-inactive").selectOption("No");
        page.getByTestId("UCSBOrganizationsForm-submit").click();

        assertThat(page.getByTestId("UCSBOrganizationsTable-cell-row-0-col-orgTranslationShort"))
                .hasText("Some Org");

        page.getByTestId("UCSBOrganizationsTable-cell-row-0-col-Edit-button").click();
        assertThat(page.getByText("Edit UCSBOrganizations")).isVisible();
        page.getByTestId("UCSBOrganizationsForm-orgTranslationShort").fill("Other Org");
        page.getByTestId("UCSBOrganizationsForm-submit").click();

        assertThat(page.getByTestId("UCSBOrganizationsTable-cell-row-0-col-orgTranslationShort")).hasText("Other Org");

        page.getByTestId("UCSBOrganizationsTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("UCSBOrganizationsTable-cell-row-0-col-orgcode")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_organization() throws Exception {
        setupUser(false);

        page.getByText("UCSB Organizations").click();

        assertThat(page.getByText("Create UCSBOrganizations")).not().isVisible();
        assertThat(page.getByTestId("UCSBOrganizationsTable-cell-row-0-col-orgcode")).not().isVisible();
    }
}