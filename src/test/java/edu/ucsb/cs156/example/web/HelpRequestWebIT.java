package edu.ucsb.cs156.example.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import java.time.LocalDateTime;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.example.WebTestCase;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class HelpRequestWebIT extends WebTestCase {
    @Test
    public void admin_user_can_create_edit_delete_helprequest() throws Exception {
        setupUser(true);

        page.getByText("Help Request").click();

        page.getByText("Create HelpRequest").click();
        assertThat(page.getByText("Create New Help Request")).isVisible();
        page.getByTestId("HelpRequestForm-requesterEmail").fill("mayarosenbaum@ucsb.edu");
        page.getByTestId("HelpRequestForm-requestTime").fill("2022-01-03T00:00");
        page.getByTestId("HelpRequestForm-explanation").fill("explanation");
        page.getByTestId("HelpRequestForm-teamId").fill("12");
        page.getByTestId("HelpRequestForm-tableOrBreakoutRoom").fill("table");
        page.getByTestId("HelpRequestForm-solved").selectOption("true");

        page.getByTestId("HelpRequestForm-submit").click();

        page.waitForSelector("[data-testid='HelpRequestTable-cell-row-0-col-requesterEmail']");

        assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail"))
                .hasText("mayarosenbaum@ucsb.edu");

        page.getByTestId("HelpRequestTable-cell-row-0-col-Edit-button").click();
        assertThat(page.getByText("Edit Help Request")).isVisible();
        page.getByTestId("HelpRequestForm-requesterEmail").fill("mayakrosenbaum@gmail.com");

        page.getByTestId("HelpRequestForm-submit").click();

        assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-requesterEmail")).hasText("mayakrosenbaum@gmail.com");

        page.getByTestId("HelpRequestTable-cell-row-0-col-Delete-button").click();

        assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation")).not().isVisible();
    }

    @Test
    public void regular_user_cannot_create_helprequest() throws Exception {
        setupUser(false);

        page.getByText("Help Request").click();

        assertThat(page.getByText("Create HelpRequest")).not().isVisible();
        assertThat(page.getByTestId("HelpRequestTable-cell-row-0-col-explanation")).not().isVisible();
    }
}